import { JitsiMeeting } from '@jitsi/react-sdk';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function VideoRoom() {
    const { roomId } = useParams(); // We use the Appointment ID as the Room ID
    const { user } = useAuth();
    const navigate = useNavigate();

    const handleReadyToClose = () => {
        navigate('/'); // Go back home when call ends
    };

    return (
        <div className="h-screen w-full bg-zinc-900 flex flex-col">
            {/* Header */}
            <div className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Leave Session
                    </Button>
                    <div className="flex items-center gap-2 text-green-400 bg-green-400/10 px-3 py-1 rounded-full text-sm font-medium">
                        <ShieldCheck className="w-4 h-4" />
                        End-to-End Encrypted
                    </div>
                </div>
                <p className="text-zinc-400 text-sm">Session ID: {roomId}</p>
            </div>

            {/* Video Interface */}
            <div className="flex-1 relative">
                <JitsiMeeting
                    domain="meet.jit.si"
                    roomName={`MindCare-Session-${roomId}`} // Unique Room Name
                    configOverwrite={{
                        startWithAudioMuted: true,
                        disableThirdPartyRequests: true,
                        prejoinPageEnabled: false, // Skip the "Join" button page for faster entry
                    }}
                    interfaceConfigOverwrite={{
                        TOOLBAR_BUTTONS: [
                            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                            'security'
                        ],
                    }}
                    userInfo={{
                        displayName: user?.name || 'Guest',
                        email: user?.email || ''
                    }}
                    onApiReady={(externalApi) => {
                        // You can add event listeners here if needed
                    }}
                    onReadyToClose={handleReadyToClose}
                    getIFrameRef={(iframeRef) => {
                        iframeRef.style.height = '100%';
                    }}
                />
            </div>
        </div>
    );
}