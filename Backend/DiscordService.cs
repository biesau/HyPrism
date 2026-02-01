using DiscordRPC;
using DiscordRPC.Logging;

namespace HyPrism.Backend;

public class DiscordService : IDisposable
{
    private const string ApplicationId = "1464867466382540995";
    
    private DiscordRpcClient? _client;
    private bool _disposed;
    private bool _enabled;
    private DateTime _startTime;
    
    public enum PresenceState
    {
        Idle,
        Downloading,
        Installing,
        Playing
    }

    public void Initialize()
    {
        if (string.IsNullOrEmpty(ApplicationId))
        {
            Logger.Info("Discord", "Discord RPC disabled (no Application ID configured)");
            _enabled = false;
            return;
        }
        
        try
        {
            _client = new DiscordRpcClient(ApplicationId);
            _client.Logger = new ConsoleLogger() { Level = LogLevel.Error };
            
            // Set SkipIdenticalPresence to false to avoid Merge issues
            _client.SkipIdenticalPresence = false;
            
            _client.OnReady += (sender, e) =>
            {
                Logger.Info("Discord", $"Connected to Discord as {e.User.Username}");
                _enabled = true;
            };
            
            _client.OnError += (sender, e) =>
            {
                Logger.Warning("Discord", $"Discord RPC error: {e.Message}");
                _enabled = false;
            };
            
            _client.OnConnectionFailed += (sender, e) =>
            {
                Logger.Warning("Discord", "Discord RPC connection failed - disabling");
                _enabled = false;
            };
            
            _client.Initialize();
            _startTime = DateTime.UtcNow;
            
            // Set initial idle presence
            SetPresence(PresenceState.Idle);
            
            Logger.Info("Discord", "Discord RPC initialized");
        }
        catch (Exception ex)
        {
            Logger.Warning("Discord", $"Failed to initialize Discord RPC: {ex.Message}");
            _enabled = false;
        }
    }

    public void SetPresence(PresenceState state, string? details = null, int? progress = null)
    {
        if (!_enabled || _client == null || !_client.IsInitialized) return;

        try
        {
            var presence = new RichPresence
            {
                Details = "In Launcher",
                State = "Browsing versions",
                Assets = new Assets
                {
                    LargeImageKey = "hyprism_logo",
                    LargeImageText = "HyPrism Launcher",
                    SmallImageKey = "hyprism_logo",
                    SmallImageText = "HyPrism"
                }
            };

            switch (state)
            {
                case PresenceState.Idle:
                    presence.Details = "In Launcher";
                    presence.State = "Browsing versions";
                    presence.Timestamps = new Timestamps(_startTime);
                    if (presence.Assets != null)
                    {
                        presence.Assets.SmallImageKey = "hyprism_logo";
                        presence.Assets.SmallImageText = "Idle";
                    }
                    break;

                case PresenceState.Downloading:
                    presence.Details = "Downloading Hytale";
                    presence.State = details ?? "Preparing...";
                    if (presence.Assets != null)
                    {
                        presence.Assets.SmallImageKey = "download";
                        presence.Assets.SmallImageText = "Downloading";
                    }
                    break;

                case PresenceState.Installing:
                    presence.Details = "Installing Hytale";
                    presence.State = details ?? "Extracting...";
                    if (presence.Assets != null)
                    {
                        presence.Assets.SmallImageKey = "install";
                        presence.Assets.SmallImageText = "Installing";
                    }
                    break;

                case PresenceState.Playing:
                    presence.Details = "Playing Hytale";
                    presence.State = details ?? "In Game";
                    presence.Timestamps = new Timestamps(DateTime.UtcNow);
                    if (presence.Assets != null)
                    {
                        presence.Assets.SmallImageKey = "playing";
                        presence.Assets.SmallImageText = "Playing";
                    }
                    break;
            }

            // Ensure assets are always populated to prevent null reference
            if (presence.Assets != null)
            {
                presence.Assets.LargeImageKey ??= "hyprism_logo";
                presence.Assets.LargeImageText ??= "HyPrism Launcher";
                presence.Assets.SmallImageKey ??= "hyprism_logo";
                presence.Assets.SmallImageText ??= "HyPrism";
            }

            _client.SetPresence(presence);
        }
        catch (Exception ex)
        {
            Logger.Warning("Discord", $"Failed to set presence: {ex.Message}");
        }
    }

    public void ClearPresence()
    {
        try
        {
            _client?.ClearPresence();
        }
        catch (Exception ex)
        {
            Logger.Warning("Discord", $"Failed to clear presence: {ex.Message}");
        }
    }

    public void Dispose()
    {
        if (_disposed) return;
        _disposed = true;
        
        try
        {
            _client?.ClearPresence();
            _client?.Dispose();
            Logger.Info("Discord", "Discord RPC disposed");
        }
        catch (Exception ex)
        {
            Logger.Warning("Discord", $"Error disposing Discord RPC: {ex.Message}");
        }
    }
}
