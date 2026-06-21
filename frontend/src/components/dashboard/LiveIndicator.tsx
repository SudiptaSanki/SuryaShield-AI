export default function LiveIndicator({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-black/40 backdrop-blur-md">
      <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-aurora-green animate-pulse' : 'bg-red-500'}`}></div>
      <span className="text-sm font-medium text-star-white tracking-wider">
        {isConnected ? 'LIVE' : 'OFFLINE'}
      </span>
    </div>
  );
}
