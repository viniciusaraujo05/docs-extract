import { motion } from 'framer-motion';
import { Head, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { 
  ShieldCheck, 
  ArrowRight,
  Lock,
  Zap,
  Check,
  X
} from 'lucide-react';



interface AuthorizeProps {
    client: {
        id: string;
        name: string;
    };
    user: {
        name: string;
        email: string;
    };
    scopes: string[];
    authToken: string;
    request: any;
}

export default function Authorize({ client, user, scopes, authToken, request }: AuthorizeProps) {
    const handleApprove = () => {
        // Passport expects a POST to /oauth/authorize with state and other params
        router.post('/oauth/authorize', {
            ...request,
            client_id: client.id,
            authToken: authToken,
        });
    };

    const handleDeny = () => {
        // Passport handles denial via a DELETE request to /oauth/authorize
        router.delete('/oauth/authorize', {
          data: {
            ...request,
            client_id: client.id,
            authToken: authToken,
          }
        });
    };

    return (
        <>
            <Head title="Authorization - DOCSET" />
            
            <div className="min-h-screen flex bg-black text-white items-center justify-center p-6 relative overflow-hidden">
                {/* Background effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-transparent to-blue-950/20" />
                <div className="absolute inset-0">
                    <motion.div 
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.div 
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl"
                        animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-lg relative z-10"
                >
                    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10 shadow-2xl">
                        <div className="flex justify-center mb-8 gap-4 items-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 overflow-hidden">
                                <img src="/docset.png" alt="Docset Logo" className="w-full h-full object-cover" />
                            </div>


                            <div className="w-8 h-px bg-white/10" />
                            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Zap className="h-8 w-8 text-yellow-400" />
                            </div>
                        </div>

                        <div className="text-center mb-10">
                            <h1 className="text-3xl font-bold mb-3 tracking-tight">Authorize {client.name}</h1>
                            <p className="text-gray-400">
                                {client.name} wants to connect to your Docset account.
                            </p>
                        </div>

                        <div className="space-y-4 mb-10">
                            <h3 className="text-xs font-semibold text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                                <ShieldCheck className="h-4 w-4 text-blue-500" />
                                Requested Permissions
                            </h3>
                            
                            <div className="bg-white/5 border border-white/5 rounded-2xl p-5 space-y-5">
                                <div className="flex gap-4">
                                    <div className="mt-1 w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                                        <Check className="h-3 w-3 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-200">Full Access</p>
                                        <p className="text-sm text-gray-500">Access to all your documents and data processing features.</p>
                                    </div>
                                </div>
                                {scopes.length > 0 && scopes.map((scope) => (
                                    <div key={scope} className="flex gap-4">
                                        <div className="mt-1 w-5 h-5 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                                            <Check className="h-3 w-3 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-200">{scope}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Button
                                variant="outline"
                                onClick={handleDeny}
                                className="h-14 bg-white/5 border-white/10 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all group"
                            >
                                <X className="mr-2 h-4 w-4 text-red-500" />
                                Deny
                            </Button>
                            <Button
                                onClick={handleApprove}
                                className="h-14 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 group"
                            >
                                Authorize
                                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 text-center">
                            <p className="text-xs text-gray-500 flex items-center justify-center gap-2">
                                <Lock className="h-3 w-3" />
                                Signed in as <span className="text-gray-300 font-medium">{user.email}</span>
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </>
    );
}
