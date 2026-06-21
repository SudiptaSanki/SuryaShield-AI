import torch
import torch.nn as nn
import torch.nn.functional as F

class Attention(nn.Module):
    def __init__(self, hidden_dim):
        super(Attention, self).__init__()
        self.attention = nn.Linear(hidden_dim, 1, bias=False)

    def forward(self, x):
        # x shape: (batch_size, seq_len, hidden_dim)
        attn_weights = F.softmax(self.attention(x).squeeze(-1), dim=1)
        # Context vector
        context = torch.sum(x * attn_weights.unsqueeze(-1), dim=1)
        return context, attn_weights

class FlarePredictorCNNLSTM(nn.Module):
    def __init__(self, input_channels=2, seq_len=60, cnn_out_channels=16, 
                 lstm_hidden=32, num_classes=5, num_features=5):
        super(FlarePredictorCNNLSTM, self).__init__()
        
        # 1D CNN for local temporal feature extraction
        self.conv1 = nn.Conv1d(in_channels=input_channels, out_channels=cnn_out_channels, kernel_size=3, padding=1)
        self.pool1 = nn.MaxPool1d(kernel_size=2)
        self.conv2 = nn.Conv1d(in_channels=cnn_out_channels, out_channels=cnn_out_channels*2, kernel_size=3, padding=1)
        self.pool2 = nn.MaxPool1d(kernel_size=2)
        
        # Calculate dimension after CNN
        self.cnn_out_seq_len = seq_len // 4
        
        # Bidirectional LSTM for long-range temporal dependencies
        self.lstm = nn.LSTM(input_size=cnn_out_channels*2, hidden_size=lstm_hidden, 
                            batch_first=True, bidirectional=True)
        
        # Attention layer
        self.attention = Attention(lstm_hidden * 2)
        
        # Fully connected layers combining time-series context and engineered features
        # Class mapping: 0=A, 1=B, 2=C, 3=M, 4=X
        self.fc1 = nn.Linear(lstm_hidden * 2 + num_features, 64)
        self.fc_class = nn.Linear(64, num_classes)
        
        # Probability of flare within 5, 15, 30 min
        self.fc_prob = nn.Linear(64, 3) 

    def forward(self, x_seq, x_feat):
        # x_seq: (batch, channels, seq_len)
        x = F.relu(self.conv1(x_seq))
        x = self.pool1(x)
        x = F.relu(self.conv2(x))
        x = self.pool2(x)
        
        # Reshape for LSTM: (batch, seq_len, channels)
        x = x.permute(0, 2, 1)
        
        # LSTM layer
        lstm_out, _ = self.lstm(x)
        
        # Attention
        context, attn_weights = self.attention(lstm_out)
        
        # Combine context with engineered features
        combined = torch.cat((context, x_feat), dim=1)
        
        # FC layers
        hidden = F.relu(self.fc1(combined))
        
        # Outputs
        class_logits = self.fc_class(hidden)
        time_probs = torch.sigmoid(self.fc_prob(hidden))
        
        return class_logits, time_probs, attn_weights

def create_mock_model():
    """Create a mock model instance for the MVP."""
    model = FlarePredictorCNNLSTM()
    model.eval()
    return model
