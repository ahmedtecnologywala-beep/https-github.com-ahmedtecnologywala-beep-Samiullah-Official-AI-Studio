import React, { useState, useRef, useEffect } from 'react';
import { AppView, Project, User, ChatMessage } from './types';
import * as GeminiService from './services/geminiService';

// --- ICONS ---
const Icons = {
  Dashboard: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
  Image: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
  Code: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>,
  Cube: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
  Chat: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>,
  Folder: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>,
  Logout: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>,
  Spinner: () => <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>,
  Magic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  Download: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
  Play: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  Upload: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4 4m0 0L8 8m4-4v12" /></svg>,
  Key: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>,
  Close: () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  Maximize: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5-5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>,
  Mic: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
  Rocket: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  SoundWave: () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>,
};

// --- HELPER COMPONENT: Sidebar Button ---
const NavBtn = ({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-2 relative overflow-hidden group
    ${active ? 'text-white bg-white/10 shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
  >
    {active && (
      <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-primary to-secondary rounded-r-full shadow-[0_0_15px_rgba(99,102,241,0.5)]"></div>
    )}
    <div className={`relative z-10 flex items-center gap-3 ${active ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform`}>
      <Icon />
      <span className="font-medium tracking-wide text-sm">{label}</span>
    </div>
  </button>
);

// --- COMPONENT: PROJECT MODAL ---
const ProjectModal = ({ project, onClose }: { project: Project, onClose: () => void }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-6xl h-[90vh] rounded-3xl flex flex-col shadow-2xl relative overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-gradient-to-br from-primary to-secondary rounded-xl text-white shadow-lg shadow-primary/20">
               {project.type === 'image' && <Icons.Image />}
               {project.type === 'code' && <Icons.Code />}
               {project.type === 'video' && <Icons.Play />}
               {project.type === '3d' && <Icons.Cube />}
               {project.type === 'audio' && <Icons.SoundWave />}
             </div>
             <div>
               <h3 className="font-bold text-white text-xl tracking-tight">{project.title}</h3>
               <p className="text-sm text-slate-400">{new Date(project.createdAt).toLocaleString()}</p>
             </div>
          </div>
          <div className="flex gap-3">
             {project.type !== 'code' && (
                <a 
                  href={project.content} 
                  download={`samiullah_project_${project.id}.${project.type === 'video' ? 'mp4' : project.type === 'audio' ? 'wav' : 'png'}`}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-full transition-all text-slate-300 hover:text-white hover:scale-105"
                  title="Download"
                >
                  <Icons.Download />
                </a>
             )}
             <button onClick={onClose} className="p-3 hover:bg-red-500/20 hover:text-red-500 rounded-full transition-all text-slate-300">
               <Icons.Close />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-gradient-to-b from-black/60 to-black/90 flex items-center justify-center p-8 relative">
           {project.type === 'image' || project.type === '3d' ? (
             <img src={project.content} alt={project.title} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
           ) : project.type === 'video' ? (
             <video src={project.content} controls autoPlay loop className="max-w-full max-h-full rounded-lg shadow-2xl" />
           ) : project.type === 'audio' ? (
             <div className="w-full max-w-md bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center animate-pulse">
                    <Icons.SoundWave />
                </div>
                <audio src={project.content} controls className="w-full" />
             </div>
           ) : (
             <iframe 
                title="Preview"
                srcDoc={project.content.replace(/```html/g, '').replace(/```/g, '')}
                className="w-full h-full bg-white rounded-xl shadow-2xl"
                sandbox="allow-scripts allow-forms allow-modals"
             />
           )}
        </div>
      </div>
    </div>
  );
};

// --- VIEW: LOGIN / SIGNUP ---
const LoginView = ({ onLogin }: { onLogin: (u: User) => void }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin({ username: username || email.split('@')[0], email });
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-black selection:bg-primary/30">
       {/* Background Effects */}
      <div className="bg-orb w-[600px] h-[600px] bg-primary top-[-100px] left-[-100px] animate-float"></div>
      <div className="bg-orb w-[500px] h-[500px] bg-secondary bottom-[-50px] right-[-100px] animate-float-delayed"></div>

      <div className="glass-panel p-10 rounded-3xl w-full max-w-md shadow-2xl relative z-10 border border-white/10 backdrop-blur-3xl">
        <div className="text-center mb-10">
            <h1 className="text-5xl font-black mb-2 bg-gradient-to-r from-primary via-purple-400 to-secondary bg-clip-text text-transparent drop-shadow-sm tracking-tight">
            Samiullah AI
            </h1>
            <p className="text-slate-400 font-medium">Next Gen Creative Studio</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 ml-1">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full input-glass rounded-xl p-4 placeholder-slate-500"
                placeholder="Enter your name"
                required
              />
            </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-bold text-slate-400 mb-2 ml-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full input-glass rounded-xl p-4 placeholder-slate-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:brightness-110 py-4 rounded-xl font-bold text-white shadow-lg shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-95">
            Enter Studio
          </button>
        </form>
      </div>
    </div>
  );
};

// --- VIEW: API KEY SELECTION ---
const ApiKeyView = ({ onComplete }: { onComplete: () => void }) => {
  const handleConnect = async () => {
    if ((window as any).aistudio) {
      try {
        await (window as any).aistudio.openSelectKey();
        onComplete();
      } catch (e) {
        console.error("Failed to select key", e);
      }
    } else {
        onComplete();
    }
  };

  return (
     <div className="flex min-h-screen items-center justify-center bg-black p-4 relative overflow-hidden">
        <div className="bg-orb w-[500px] h-[500px] bg-accent opacity-20 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-[100px]"></div>
       <div className="glass-panel p-12 rounded-3xl w-full max-w-lg text-center border border-white/10 relative z-10">
         <div className="w-24 h-24 bg-gradient-to-tr from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/30 animate-pulse-slow">
            <Icons.Key />
         </div>
         <h2 className="text-4xl font-bold mb-4">Connect AI Key</h2>
         <p className="text-slate-400 mb-8 leading-relaxed text-lg">
           Unlock the full potential of Veo Video, 3D Models, and High-Fidelity Audio.
         </p>
         <button 
           onClick={handleConnect}
           className="w-full bg-white text-black hover:bg-slate-200 py-4 rounded-xl font-bold shadow-lg transition-all transform hover:scale-[1.02]"
         >
           Select Google Cloud Key
         </button>
       </div>
     </div>
  );
};

// --- VIEW: 3D STUDIO ---
const ThreeDStudio = ({ onSaveProject, onError }: { onSaveProject: (p: Project) => void, onError: (e:any) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'generate' | 'animate'>('generate');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [status, setStatus] = useState('');

  const handleGenerate = async () => {
      if (!prompt) return;
      setLoading(true);
      setResult(null);
      setStatus(mode === 'generate' ? 'Modeling Character...' : 'Animating Video...');
      
      try {
          if (mode === 'generate') {
              const enhancedPrompt = `High quality 3D render of ${prompt}, unreal engine 5, octane render, 8k, detailed textures, cinematic lighting, character sheet style`;
              const res = await GeminiService.generateImage(enhancedPrompt, { isHighQuality: true, aspectRatio: '1:1' });
              setResult(res);
              setSelectedImage(res);
              onSaveProject({
                  id: Date.now().toString(),
                  title: '3D: ' + prompt.slice(0, 15),
                  type: '3d',
                  content: res,
                  createdAt: Date.now()
              });
          } else {
              if (!selectedImage) {
                  alert("Please generate or upload a character first!");
                  return;
              }
              const res = await GeminiService.generateAnimation(prompt, selectedImage);
              setResult(res);
              onSaveProject({
                  id: Date.now().toString(),
                  title: 'Anim: ' + prompt.slice(0, 15),
                  type: 'video',
                  content: res,
                  createdAt: Date.now()
              });
          }
      } catch(e) {
          onError(e);
      } finally {
          setLoading(false);
          setStatus('');
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
      <div className="p-8 h-full flex flex-col overflow-y-auto">
          <h2 className="text-4xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent">
              <Icons.Cube /> 3D Character & Animation
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                  <div className="glass p-8 rounded-3xl border border-white/10 relative overflow-hidden">
                       <div className="flex gap-2 mb-6 p-1 bg-black/40 rounded-xl border border-white/5">
                           <button onClick={() => setMode('generate')} className={`flex-1 py-3 rounded-lg font-bold transition-all text-sm ${mode === 'generate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>1. Create Character</button>
                           <button onClick={() => setMode('animate')} className={`flex-1 py-3 rounded-lg font-bold transition-all text-sm ${mode === 'animate' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>2. Animate (Veo)</button>
                       </div>

                       {mode === 'animate' && (
                           <div className="mb-6 animate-in slide-in-from-top-4 fade-in">
                               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Source Character</label>
                               <div className="relative border-2 border-dashed border-white/10 hover:border-indigo-500/50 rounded-2xl p-4 transition-all text-center cursor-pointer bg-white/5 group hover:bg-white/10">
                                   <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                   {selectedImage ? (
                                       <img src={selectedImage} alt="Source" className="h-32 mx-auto rounded-lg shadow-lg object-contain" />
                                   ) : (
                                       <div className="py-6 text-slate-400 group-hover:text-white">
                                           <Icons.Upload />
                                           <span className="block mt-2 font-medium text-sm">Upload or Generate Character first</span>
                                       </div>
                                   )}
                               </div>
                           </div>
                       )}

                       <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">
                           {mode === 'generate' ? 'Character Description' : 'Animation Action'}
                       </label>
                       <textarea 
                           value={prompt}
                           onChange={(e) => setPrompt(e.target.value)}
                           className="w-full input-glass rounded-xl p-4 h-32 resize-none text-lg"
                           placeholder={mode === 'generate' ? "e.g., A cute robot with glowing blue eyes, metallic finish..." : "e.g., The character waves hello and starts dancing..."}
                       />
                  </div>

                  <button 
                      onClick={handleGenerate}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-500/40 py-5 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 text-lg"
                  >
                      {loading ? <Icons.Spinner /> : <Icons.Magic />}
                      {loading ? status : (mode === 'generate' ? 'Generate 3D Model' : 'Render Animation')}
                  </button>
              </div>

              <div className="glass rounded-3xl flex items-center justify-center p-8 relative overflow-hidden min-h-[400px] border border-white/10 shadow-2xl">
                  {loading && (
                      <div className="absolute inset-0 z-20 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-white font-medium tracking-widest animate-pulse">{status}</p>
                      </div>
                  )}

                  {result ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center animate-in zoom-in duration-500">
                           {mode === 'generate' ? (
                               <img src={result} alt="3D Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10" />
                           ) : (
                               <video src={result} controls autoPlay loop className="max-w-full max-h-full rounded-lg shadow-2xl ring-1 ring-white/10" />
                           )}
                           <a href={result} download={`samiullah_3d_${Date.now()}.${mode === 'generate' ? 'png' : 'mp4'}`} className="absolute bottom-6 right-6 bg-white text-black p-4 rounded-full shadow-xl hover:scale-110 transition-transform">
                               <Icons.Download />
                           </a>
                      </div>
                  ) : (
                      <div className="text-center opacity-30 relative z-10">
                          <div className="transform scale-150 mb-6 inline-block"><Icons.Cube /></div>
                          <h3 className="text-2xl font-bold">3D Studio</h3>
                          <p className="mt-2 text-lg">Create Characters & Animations.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
  );
};

// --- VIEW: CHAT & AI ASSISTANT ---
const ChatHelperView = ({ onError }: { onError: (e:any) => void }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [liveActive, setLiveActive] = useState(false);
    const [liveStatus, setLiveStatus] = useState('');
    const liveSessionRef = useRef<GeminiService.LiveSession | null>(null);

    const handleSend = async () => {
        if (!input) return;
        const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
          const history = messages.map(m => ({
              role: m.role,
              parts: [{ text: m.text }]
          }));
          const responseText = await GeminiService.generateChatResponse(history, input);
          setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
        } catch (e) {
          onError(e);
        } finally {
          setLoading(false);
        }
    };

    const toggleLive = async () => {
        if (liveActive) {
            liveSessionRef.current?.disconnect();
            setLiveActive(false);
            setLiveStatus('');
        } else {
            setLiveActive(true);
            liveSessionRef.current = new GeminiService.LiveSession();
            await liveSessionRef.current.connect(
                (status) => setLiveStatus(status),
                (err) => {
                    onError({ message: err });
                    setLiveActive(false);
                }
            );
        }
    };

    // Cleanup live session on unmount
    useEffect(() => {
        return () => {
            if (liveSessionRef.current) {
                liveSessionRef.current.disconnect();
            }
        };
    }, []);

    return (
        <div className="p-8 h-full flex flex-col overflow-hidden">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-4xl font-black flex items-center gap-4 bg-gradient-to-r from-green-400 to-teal-500 bg-clip-text text-transparent">
                    <Icons.Chat /> AI Personal Assistant
                </h2>
                <div className="flex bg-white/5 border border-white/10 rounded-xl p-1">
                    <button 
                        onClick={() => liveActive && toggleLive()} 
                        className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${!liveActive ? 'bg-white/10 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Text Chat
                    </button>
                    <button 
                         onClick={() => !liveActive && toggleLive()} 
                         className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${liveActive ? 'bg-red-500/20 text-red-400 border border-red-500/50 shadow-lg animate-pulse' : 'text-slate-400 hover:text-white'}`}
                    >
                        Live Voice
                    </button>
                </div>
             </div>

             <div className="flex-1 glass rounded-3xl border border-white/10 relative overflow-hidden shadow-2xl flex flex-col">
                {liveActive ? (
                    <div className="flex-1 flex flex-col items-center justify-center relative bg-black/40">
                         {/* Visualizer Background */}
                         <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                             <div className="w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500 to-green-500 rounded-full blur-[120px] opacity-20 animate-pulse-slow"></div>
                         </div>
                         
                         <div className="relative z-10 flex flex-col items-center gap-10">
                             <div className="w-64 h-64 rounded-full border-[6px] border-white/5 flex items-center justify-center bg-black/30 shadow-[0_0_80px_rgba(34,197,94,0.3)] backdrop-blur-sm relative">
                                  <div className="absolute inset-0 rounded-full border border-white/10 animate-[spin_8s_linear_infinite]"></div>
                                  <div className="w-48 h-48 rounded-full bg-gradient-to-tr from-green-400 to-teal-600 flex items-center justify-center shadow-lg animate-[pulse_2s_infinite]">
                                      <div className="scale-[2.5] text-white"><Icons.Mic /></div>
                                  </div>
                             </div>
                             
                             <div className="text-center">
                                 <h3 className="text-3xl font-bold tracking-tight mb-2 text-white">{liveStatus || "Listening..."}</h3>
                                 <p className="text-lg text-slate-400 font-medium max-w-md mx-auto">
                                     Speak in any language (Urdu, Hindi, English). I will reply in the same language.
                                 </p>
                             </div>

                             <button 
                                onClick={toggleLive}
                                className="px-10 py-4 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded-full text-red-400 font-bold text-lg transition-all hover:scale-105"
                             >
                                End Voice Call
                             </button>
                         </div>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {messages.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <div className="transform scale-[2] mb-6"><Icons.Chat /></div>
                                    <p className="text-xl font-light">How can I help you today?</p>
                                </div>
                            )}
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
                                    <div className={`max-w-[70%] p-6 rounded-3xl text-base leading-relaxed shadow-lg ${m.role === 'user' ? 'bg-gradient-to-br from-green-500 to-emerald-700 text-white rounded-tr-none' : 'bg-white/10 text-slate-100 rounded-tl-none border border-white/5'}`}>
                                        {m.text}
                                    </div>
                                </div>
                            ))}
                            {loading && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 px-6 py-4 rounded-3xl rounded-tl-none border border-white/5 flex gap-2 items-center">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 bg-black/20 border-t border-white/10">
                            <div className="flex gap-4">
                                <input 
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    className="flex-1 input-glass rounded-2xl px-6 py-4 text-lg placeholder-slate-500 shadow-inner"
                                    placeholder="Type your message here..."
                                />
                                <button 
                                    onClick={handleSend}
                                    disabled={loading}
                                    className="px-8 bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl text-white font-bold hover:shadow-lg hover:shadow-green-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:scale-100"
                                >
                                    <Icons.Rocket />
                                </button>
                            </div>
                        </div>
                    </>
                )}
             </div>
        </div>
    );
};

// --- VIEW: IMAGE STUDIO ---
const ImageStudio = ({ onSaveProject, onError }: { onSaveProject: (p: Project) => void, onError: (e:any) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<'generate' | 'edit'>('generate');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '9:16' | '3:4' | '4:3'>('1:1');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAction = async () => {
    if (!prompt) return;
    setLoading(true);
    setResult(null);
    try {
      if (mode === 'generate') {
         const res = await GeminiService.generateImage(prompt, { aspectRatio: aspectRatio });
         setResult(res);
         onSaveProject({
           id: Date.now().toString(),
           title: prompt.slice(0, 20) + '...',
           type: 'image',
           content: res,
           createdAt: Date.now()
         });
      } else {
         if (!selectedImage) return;
         const res = await GeminiService.editImageStyle(selectedImage, prompt);
         setResult(res);
         onSaveProject({
           id: Date.now().toString(),
           title: 'Edit: ' + prompt.slice(0, 15),
           type: 'image',
           content: res,
           createdAt: Date.now()
         });
      }
    } catch (error) {
      onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col overflow-y-auto">
       <h2 className="text-4xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-primary via-purple-400 to-pink-500 bg-clip-text text-transparent">
         <Icons.Image /> Image Lab
       </h2>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
         <div className="space-y-6">
            <div className="glass p-1 rounded-xl w-fit flex gap-1 bg-black/40">
              <button onClick={() => setMode('generate')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'generate' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Generate</button>
              <button onClick={() => setMode('edit')} className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'edit' ? 'bg-primary text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Edit/Style</button>
            </div>

            {mode === 'edit' && (
               <div className="glass border-2 border-dashed border-white/10 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 transition-all relative group bg-white/5">
                 <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                 {selectedImage ? (
                   <img src={selectedImage} alt="Upload" className="max-h-48 mx-auto rounded-lg shadow-lg" />
                 ) : (
                   <div className="py-4 text-slate-400 group-hover:text-white transition-colors">
                     <Icons.Upload />
                     <span className="block mt-2 font-medium">Click to upload image</span>
                   </div>
                 )}
               </div>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Aspect Ratio</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                 {[
                    { label: 'Square (1:1)', val: '1:1' },
                    { label: 'Landscape (16:9)', val: '16:9' },
                    { label: 'Story (9:16)', val: '9:16' },
                    { label: 'Portrait (3:4)', val: '3:4' },
                    { label: 'Standard (4:3)', val: '4:3' }
                 ].map(opt => (
                     <button 
                        key={opt.val} 
                        onClick={() => setAspectRatio(opt.val as any)}
                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${aspectRatio === opt.val ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'}`}
                     >
                        {opt.label}
                     </button>
                 ))}
              </div>
            </div>

            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Magic Prompt</label>
                  <textarea 
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full input-glass rounded-xl p-4 mt-2 h-32 resize-none text-lg"
                    placeholder={mode === 'generate' ? "A futuristic neon city with flying cars..." : "Make it look like a pencil sketch..."}
                  />
               </div>
               
               <button 
                 onClick={handleAction}
                 disabled={loading}
                 className="w-full bg-gradient-to-r from-primary to-purple-600 hover:shadow-primary/40 py-5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-95 text-white shadow-xl text-lg"
               >
                 {loading ? <Icons.Spinner /> : <Icons.Magic />}
                 {loading ? 'Creating Magic...' : mode === 'generate' ? 'Generate Art' : 'Transform Image'}
               </button>
            </div>
         </div>

         <div className="glass rounded-3xl border border-white/10 flex items-center justify-center p-8 relative overflow-hidden min-h-[400px] shadow-2xl">
             {result ? (
               <div className="relative group w-full h-full flex items-center justify-center animate-in zoom-in duration-500">
                  <img src={result} alt="Result" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl ring-1 ring-white/10" />
                  <a href={result} download="generated.png" className="absolute bottom-6 right-6 bg-white text-black p-4 rounded-full opacity-0 group-hover:opacity-100 transition-all shadow-xl hover:scale-110">
                    <Icons.Download />
                  </a>
               </div>
             ) : (
               <div className="text-center text-slate-500 opacity-30">
                  <div className="transform scale-150 mb-4 inline-block"><Icons.Image /></div>
                  <p className="mt-2 text-lg font-light">Your masterpiece will appear here</p>
               </div>
             )}
         </div>
       </div>
    </div>
  );
};

// --- VIEW: CGI STUDIO ---
const CGIStudio = ({ onSaveProject, onError }: { onSaveProject: (p: Project) => void, onError: (e:any) => void }) => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [style, setStyle] = useState('Cinematic');
    const [productImage, setProductImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [result, setResult] = useState<{ video: string, slogan: string, audio: string, voiceover: string } | null>(null);
    const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProductImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleGenerate = async () => {
        if (!productName || !description) return;
        setLoading(true);
        setStatus('Creating Concept & Script...');
        setResult(null);

        try {
            const concept = await GeminiService.generateAdConcept(productName, description, style);
            setStatus(`Rendering Video (Veo) & Audio... This can take 1-2 minutes.`);
            
            const videoPromise = GeminiService.generateAnimation(
                concept.visualPrompt, 
                productImage || undefined,
                aspectRatio
            );
            
            const audioPromise = GeminiService.generateSpeech(concept.voiceover, 'Fenrir');

            const [videoData, audioData] = await Promise.all([videoPromise, audioPromise]);

            setResult({ video: videoData, slogan: concept.slogan, audio: audioData, voiceover: concept.voiceover });
            
            onSaveProject({
                id: Date.now().toString(),
                title: `CGI Ad: ${productName}`,
                type: 'video',
                content: videoData,
                createdAt: Date.now()
            });
        } catch (e) {
            onError(e);
        } finally {
            setLoading(false);
            setStatus('');
        }
    };

    return (
        <div className="p-8 h-full flex flex-col overflow-y-auto">
            <h2 className="text-4xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-orange-400 via-red-400 to-pink-500 bg-clip-text text-transparent">
                <Icons.Rocket /> CGI Ad Creator
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="glass p-8 rounded-3xl shadow-2xl border border-white/10">
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Product Name</label>
                                <input 
                                    value={productName}
                                    onChange={(e) => setProductName(e.target.value)}
                                    className="w-full input-glass rounded-xl p-4"
                                    placeholder="e.g., 'AeroStride X1'"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Product Description</label>
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full input-glass rounded-xl p-4 h-28 resize-none"
                                    placeholder="Describe your product's key features and look..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Visual Style</label>
                                    <select 
                                        value={style} 
                                        onChange={(e) => setStyle(e.target.value)}
                                        className="w-full input-glass rounded-xl p-4 appearance-none cursor-pointer"
                                    >
                                        <option>Cinematic Luxury</option>
                                        <option>Neon Cyberpunk</option>
                                        <option>Minimalist Studio</option>
                                        <option>Organic Nature</option>
                                        <option>High-Energy Sport</option>
                                    </select>
                                </div>
                                <div>
                                     <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Format</label>
                                     <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 h-[58px]">
                                         <button onClick={() => setAspectRatio('16:9')} className={`flex-1 text-xs font-bold rounded-lg transition-all ${aspectRatio === '16:9' ? 'bg-orange-500/20 text-orange-500 shadow-lg' : 'text-slate-500 hover:text-white'}`}>16:9</button>
                                         <button onClick={() => setAspectRatio('9:16')} className={`flex-1 text-xs font-bold rounded-lg transition-all ${aspectRatio === '9:16' ? 'bg-orange-500/20 text-orange-500 shadow-lg' : 'text-slate-500 hover:text-white'}`}>9:16</button>
                                     </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">Reference Image (Optional)</label>
                                <div className="relative border-2 border-dashed border-white/10 hover:border-orange-500/50 rounded-xl p-6 transition-colors text-center cursor-pointer group bg-white/5 hover:bg-white/10">
                                    <input type="file" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                    {productImage ? (
                                        <div className="flex items-center justify-center gap-3">
                                            <img src={productImage} alt="Ref" className="h-12 w-12 rounded-lg object-cover shadow-lg" />
                                            <span className="text-sm text-green-400 font-medium">Image Loaded</span>
                                        </div>
                                    ) : (
                                        <div className="text-slate-500 group-hover:text-white transition-colors">
                                            <Icons.Upload />
                                            <span className="text-sm block mt-2 font-medium">Upload Product Shot</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full mt-8 bg-gradient-to-r from-orange-500 to-pink-600 hover:shadow-orange-500/40 py-5 rounded-2xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 text-lg"
                        >
                            {loading ? <Icons.Spinner /> : <Icons.Rocket />}
                            {loading ? 'Producing...' : 'Generate CGI Ad'}
                        </button>
                    </div>
                </div>

                {/* Preview */}
                <div className="lg:col-span-7 glass rounded-3xl border border-white/10 flex flex-col items-center justify-center p-4 relative overflow-hidden min-h-[500px] shadow-2xl">
                    {loading && (
                        <div className="absolute inset-0 z-10 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center">
                            <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                            <p className="text-2xl font-light text-white animate-pulse text-center px-4 tracking-wide">{status}</p>
                        </div>
                    )}

                    {result ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center animate-in fade-in duration-700 overflow-y-auto">
                             <div className={`relative rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 mb-6 ${aspectRatio === '9:16' ? 'max-w-[280px]' : 'w-full max-w-2xl'}`}>
                                 <video src={result.video} controls autoPlay loop className="w-full h-full object-cover" />
                             </div>
                             
                             <div className="text-center max-w-lg mb-6">
                                 <h3 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 drop-shadow-sm mb-4">
                                     "{result.slogan}"
                                 </h3>
                                 <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col gap-2">
                                     <div className="flex items-center gap-2 text-xs text-orange-400 font-bold uppercase tracking-widest">
                                        <Icons.Mic /> Voiceover Preview
                                     </div>
                                     <audio src={result.audio} controls className="w-full h-8" />
                                     <p className="text-xs text-slate-500 italic mt-1">"{result.voiceover}"</p>
                                 </div>
                             </div>

                             <a href={result.video} download="cgi_ad.mp4" className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-xl transition-all shadow-lg hover:scale-110">
                                 <Icons.Download />
                             </a>
                        </div>
                    ) : (
                        <div className="text-center opacity-30">
                            <div className="transform scale-150 mb-6 inline-block text-white"><Icons.Rocket /></div>
                            <h3 className="text-2xl font-bold text-white">CGI Ad Studio</h3>
                            <p className="mt-2 text-lg text-slate-300">Create professional product commercials.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- VIEW: CODE DEV ---
const CodeDev = ({ onSaveProject }: { onSaveProject: (p: Project) => void }) => {
  const [prompt, setPrompt] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'code' | 'preview'>('preview');

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setTab('preview');
    try {
      const generated = await GeminiService.generateCode(prompt);
      setCode(generated);
      onSaveProject({
        id: Date.now().toString(),
        title: 'App: ' + prompt.slice(0, 15),
        type: 'code',
        content: generated,
        createdAt: Date.now()
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <h2 className="text-4xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
          <Icons.Code /> Web & Game Dev
      </h2>
      
      <div className="flex gap-4 mb-6">
        <input 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-1 input-glass rounded-xl px-6 h-16 text-lg placeholder-slate-500"
          placeholder="Describe your website or game (e.g., 'Snake game in green theme')..."
        />
        <button 
           onClick={handleGenerate}
           disabled={loading}
           className="bg-green-600 hover:bg-green-500 px-8 rounded-xl font-bold disabled:opacity-50 transition-all shadow-lg shadow-green-900/40 text-lg hover:scale-[1.02] active:scale-95"
        >
          {loading ? <Icons.Spinner /> : 'Develop'}
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-card border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
         <div className="flex border-b border-white/10 bg-black/40">
            <button onClick={() => setTab('preview')} className={`px-8 py-4 text-sm font-bold tracking-wide transition-all ${tab === 'preview' ? 'text-green-400 border-b-2 border-green-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}>Preview</button>
            <button onClick={() => setTab('code')} className={`px-8 py-4 text-sm font-bold tracking-wide transition-all ${tab === 'code' ? 'text-green-400 border-b-2 border-green-400 bg-white/5' : 'text-slate-400 hover:text-white'}`}>Source Code</button>
         </div>
         
         <div className="flex-1 relative bg-white">
            {loading ? (
              <div className="absolute inset-0 bg-dark flex items-center justify-center text-green-500">
                 <div className="flex flex-col items-center animate-pulse">
                    <Icons.Spinner />
                    <span className="mt-4 text-lg font-light tracking-widest">CODING PROJECT...</span>
                 </div>
              </div>
            ) : code ? (
               tab === 'preview' ? (
                 <iframe 
                   title="preview"
                   srcDoc={code.replace(/```html/g, '').replace(/```/g, '')}
                   className="w-full h-full border-none"
                   sandbox="allow-scripts allow-forms allow-modals"
                 />
               ) : (
                 <pre className="p-6 text-sm text-green-400 bg-[#0d1117] h-full overflow-auto font-mono leading-relaxed">
                   {code}
                 </pre>
               )
            ) : (
               <div className="absolute inset-0 bg-[#0d1117] flex items-center justify-center text-slate-600">
                 <p className="text-lg">Enter a prompt to start developing</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

// --- VIEW: TTS STUDIO ---
const TTSStudio = ({ onSaveProject, onError }: { onSaveProject: (p: Project) => void, onError: (e:any) => void }) => {
  const [text, setText] = useState('');
  const [voice, setVoice] = useState('Kore');
  const [loading, setLoading] = useState(false);
  const [audioResult, setAudioResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!text) return;
    setLoading(true);
    setAudioResult(null);
    try {
      const result = await GeminiService.generateSpeech(text, voice);
      setAudioResult(result);
      onSaveProject({
        id: Date.now().toString(),
        title: 'Speech: ' + text.slice(0, 15),
        type: 'audio',
        content: result,
        createdAt: Date.now()
      });
    } catch (e) {
      onError(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
       <h2 className="text-4xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
         <Icons.SoundWave /> Voice Studio
       </h2>
       
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
         <div className="space-y-6">
            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Voice Selection</label>
               <div className="flex flex-wrap gap-2">
                 {['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'].map(v => (
                   <button 
                     key={v}
                     onClick={() => setVoice(v)}
                     className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${voice === v ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-lg' : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'}`}
                   >
                     {v}
                   </button>
                 ))}
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Script</label>
               <textarea 
                 value={text}
                 onChange={(e) => setText(e.target.value)}
                 className="w-full input-glass rounded-xl p-4 h-48 resize-none text-lg"
                 placeholder="Type what you want the AI to say..."
               />
            </div>

            <button 
               onClick={handleGenerate}
               disabled={loading}
               className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-cyan-500/40 py-4 rounded-xl font-bold text-white shadow-xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.01] active:scale-95 disabled:opacity-50 text-lg"
            >
               {loading ? <Icons.Spinner /> : <Icons.SoundWave />}
               {loading ? 'Synthesizing...' : 'Generate Speech'}
            </button>
         </div>

         <div className="glass rounded-3xl border border-white/10 flex items-center justify-center p-8 relative overflow-hidden min-h-[400px] shadow-2xl">
             {audioResult ? (
                <div className="text-center w-full max-w-md animate-in zoom-in duration-500">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(6,182,212,0.5)] animate-pulse-slow">
                        <div className="scale-[2] text-white"><Icons.SoundWave /></div>
                    </div>
                    <audio src={audioResult} controls className="w-full mb-6" />
                    <a href={audioResult} download={`speech_${Date.now()}.wav`} className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-slate-200 transition-colors">
                        <Icons.Download /> Download WAV
                    </a>
                </div>
             ) : (
                <div className="text-center opacity-30">
                    <div className="transform scale-150 mb-6 inline-block"><Icons.SoundWave /></div>
                    <h3 className="text-2xl font-bold">Text to Speech</h3>
                    <p className="mt-2 text-lg">Lifelike AI Voices.</p>
                </div>
             )}
         </div>
       </div>
    </div>
  );
};

// --- VIEW: PROJECTS GALLERY ---
const ProjectsView = ({ projects, onSelect }: { projects: Project[], onSelect: (p: Project) => void }) => {
    return (
        <div className="p-8 h-full overflow-y-auto">
             <h2 className="text-4xl font-black mb-8 flex items-center gap-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                <Icons.Folder /> My Projects
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                 {/* Upload Button */}
                 <div className="glass p-6 rounded-3xl border-2 border-dashed border-white/10 hover:border-primary/50 cursor-pointer flex flex-col items-center justify-center text-center group transition-all bg-white/5 hover:bg-white/10 h-64" onClick={() => document.getElementById('gallery-upload')?.click()}>
                    <input id="gallery-upload" type="file" className="hidden" multiple onChange={(e) => {
                        const fileList = e.target.files;
                        if (!fileList) return;
                        const files = Array.from(fileList);
                        files.forEach(file => {
                            const reader = new FileReader();
                            reader.onload = () => {
                                // This is a visual-only addition for the gallery view in this snippet. 
                                // Real implementation would lift state up.
                            };
                            reader.readAsDataURL(file);
                        });
                    }} />
                    <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors group-hover:scale-110 duration-300">
                        <Icons.Upload />
                    </div>
                    <span className="text-sm font-bold text-slate-400 group-hover:text-white">Upload New</span>
                </div>

                {projects.map(p => (
                    <div key={p.id} onClick={() => onSelect(p)} className="glass p-4 rounded-3xl cursor-pointer hover:bg-white/10 transition-all group relative overflow-hidden h-64 flex flex-col">
                        <div className="flex-1 rounded-2xl bg-black/40 mb-3 overflow-hidden flex items-center justify-center relative">
                            {p.type === 'image' || p.type === '3d' ? <img src={p.content} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" alt={p.title} /> : 
                            p.type === 'video' ? <video src={p.content} className="w-full h-full object-cover" /> :
                            p.type === 'audio' ? <div className="text-emerald-500 scale-150"><Icons.SoundWave /></div> :
                            <div className="text-green-500 scale-150"><Icons.Code /></div>}
                            
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                <Icons.Maximize />
                            </div>
                        </div>
                        <h4 className="font-bold text-sm truncate text-white group-hover:text-primary transition-colors px-1">{p.title}</h4>
                        <div className="flex justify-between items-center mt-1 px-1">
                            <span className="text-[10px] text-slate-500 uppercase font-bold bg-white/5 px-2 py-1 rounded-full">{p.type}</span>
                            <span className="text-[10px] text-slate-600">{new Date(p.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN APP COMPONENT ---
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<AppView>(AppView.LOGIN);
  const [projects, setProjects] = useState<Project[]>(() => {
      try {
        const saved = localStorage.getItem('samiullah_projects');
        return saved ? JSON.parse(saved) : [];
      } catch (e) {
        return [];
      }
  });
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    const checkKey = async () => {
      try {
        // Safe check for process.env
        if (typeof process !== "undefined" && process.env && process.env.API_KEY) {
            setHasApiKey(true);
            return;
        }
        if ((window as any).aistudio) {
            const hasKey = await (window as any).aistudio.hasSelectedApiKey();
            setHasApiKey(hasKey);
        } else {
             // If neither is present, set to false (will show key selection screen)
             setHasApiKey(false);
        }
      } catch (e) {
        console.error("Key check failed", e);
        setHasApiKey(false);
      }
    };
    checkKey();
  }, []);

  const handleSaveProject = (newProject: Project) => {
    const updated = [newProject, ...projects];
    setProjects(updated);
    localStorage.setItem('samiullah_projects', JSON.stringify(updated));
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    const files = Array.from(fileList);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const newProject: Project = {
          id: Date.now().toString() + Math.random(),
          title: file.name,
          type: file.type.startsWith('video') ? 'video' : file.type.startsWith('audio') ? 'audio' : 'image',
          content: reader.result as string,
          createdAt: Date.now()
        };
        handleSaveProject(newProject);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleError = (error: any) => {
    const msg = error?.message || "An unexpected error occurred.";
    alert(msg);
  };

  if (!user) return <LoginView onLogin={setUser} />;
  
  if (!hasApiKey) return <ApiKeyView onComplete={() => setHasApiKey(true)} />;

  return (
    <div className="flex h-screen bg-black text-white selection:bg-primary/30 overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[150px] animate-float"></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary/10 blur-[150px] animate-float-delayed"></div>
      </div>

      {/* Sidebar */}
      <div className="w-72 glass border-r border-white/10 flex flex-col p-6 z-20">
        <div className="mb-10 pl-2">
            <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">Samiullah AI</h1>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-widest mt-1">Creative Suite v2.0</p>
        </div>
        
        <nav className="flex-1 space-y-1 overflow-y-auto pr-2 scrollbar-hide">
          <NavBtn active={currentView === AppView.DASHBOARD} onClick={() => setCurrentView(AppView.DASHBOARD)} icon={Icons.Dashboard} label="Dashboard" />
          <NavBtn active={currentView === AppView.IMAGE_STUDIO} onClick={() => setCurrentView(AppView.IMAGE_STUDIO)} icon={Icons.Image} label="Image Lab" />
          <NavBtn active={currentView === AppView.CGI_STUDIO} onClick={() => setCurrentView(AppView.CGI_STUDIO)} icon={Icons.Rocket} label="CGI Ad Creator" />
          <NavBtn active={currentView === AppView.THREE_D_STUDIO} onClick={() => setCurrentView(AppView.THREE_D_STUDIO)} icon={Icons.Cube} label="3D & Animation" />
          <NavBtn active={currentView === AppView.TTS_STUDIO} onClick={() => setCurrentView(AppView.TTS_STUDIO)} icon={Icons.SoundWave} label="Voice Studio" />
          <NavBtn active={currentView === AppView.CODE_DEV} onClick={() => setCurrentView(AppView.CODE_DEV)} icon={Icons.Code} label="Code Developer" />
          <NavBtn active={currentView === AppView.CHAT_HELPER} onClick={() => setCurrentView(AppView.CHAT_HELPER)} icon={Icons.Chat} label="AI Assistant" />
          <NavBtn active={currentView === AppView.PROJECTS} onClick={() => setCurrentView(AppView.PROJECTS)} icon={Icons.Folder} label="My Gallery" />
        </nav>

        <div className="pt-6 border-t border-white/10 mt-4">
           <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 border border-white/20"></div>
              <div>
                  <p className="text-sm font-bold">{user.username}</p>
                  <p className="text-xs text-slate-500">Pro Plan</p>
              </div>
           </div>
           <button onClick={() => setUser(null)} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-white px-2 transition-colors">
               <Icons.Logout /> Sign Out
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10 overflow-hidden bg-black/20 backdrop-blur-sm">
        {currentView === AppView.DASHBOARD && (
          <div className="p-8 h-full overflow-y-auto">
            <h2 className="text-4xl font-black mb-2">Welcome back, {user.username}</h2>
            <p className="text-slate-400 mb-8 text-lg">What will you create today?</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[
                 { title: 'Image Lab', desc: 'Generate Logos, Art & Thumbnails', icon: Icons.Image, view: AppView.IMAGE_STUDIO, color: 'from-blue-500 to-indigo-600' },
                 { title: 'CGI Ad Creator', desc: 'Cinematic Product Videos', icon: Icons.Rocket, view: AppView.CGI_STUDIO, color: 'from-orange-400 to-pink-600' },
                 { title: '3D & Animation', desc: 'Characters & Motion', icon: Icons.Cube, view: AppView.THREE_D_STUDIO, color: 'from-purple-500 to-indigo-500' },
                 { title: 'Voice Studio', desc: 'Text to Speech (Multi-lingual)', icon: Icons.SoundWave, view: AppView.TTS_STUDIO, color: 'from-cyan-400 to-blue-500' },
                 { title: 'Web Developer', desc: 'Build Apps & Games', icon: Icons.Code, view: AppView.CODE_DEV, color: 'from-green-500 to-emerald-600' },
                 { title: 'AI Assistant', desc: 'Chat & Live Voice Call', icon: Icons.Chat, view: AppView.CHAT_HELPER, color: 'from-teal-400 to-green-500' },
               ].map((item, i) => (
                 <div key={i} onClick={() => setCurrentView(item.view)} className="group glass p-8 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all hover:scale-[1.02] relative overflow-hidden">
                    <div className={`absolute top-0 right-0 p-32 bg-gradient-to-br ${item.color} opacity-10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:opacity-20 transition-opacity`}></div>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-6 shadow-lg`}>
                       <div className="text-white transform scale-125"><item.icon /></div>
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                 </div>
               ))}
            </div>

            <div className="mt-12">
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-2xl font-bold flex items-center gap-2"><Icons.Folder /> Recent Projects</h3>
                 <button onClick={() => setCurrentView(AppView.PROJECTS)} className="text-sm font-bold text-primary hover:text-white transition-colors">View All</button>
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {projects.slice(0, 4).map(p => (
                      <div key={p.id} onClick={() => setSelectedProject(p)} className="glass p-4 rounded-2xl cursor-pointer hover:bg-white/10 transition-all">
                          <div className="h-32 bg-black/40 rounded-xl mb-3 overflow-hidden">
                              {p.type === 'image' || p.type === '3d' ? <img src={p.content} className="w-full h-full object-cover" alt="" /> : 
                               p.type === 'video' ? <video src={p.content} className="w-full h-full object-cover" /> :
                               <div className="w-full h-full flex items-center justify-center text-slate-600"><Icons.Folder /></div>}
                          </div>
                          <p className="font-bold text-sm truncate px-1">{p.title}</p>
                      </div>
                  ))}
                  {projects.length === 0 && (
                      <div className="col-span-4 text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-2xl">No projects yet. Start creating!</div>
                  )}
               </div>
            </div>
          </div>
        )}

        {currentView === AppView.IMAGE_STUDIO && <ImageStudio onSaveProject={handleSaveProject} onError={handleError} />}
        {currentView === AppView.CGI_STUDIO && <CGIStudio onSaveProject={handleSaveProject} onError={handleError} />}
        {currentView === AppView.THREE_D_STUDIO && <ThreeDStudio onSaveProject={handleSaveProject} onError={handleError} />}
        {currentView === AppView.TTS_STUDIO && <TTSStudio onSaveProject={handleSaveProject} onError={handleError} />}
        {currentView === AppView.CODE_DEV && <CodeDev onSaveProject={handleSaveProject} />}
        {currentView === AppView.CHAT_HELPER && <ChatHelperView onError={handleError} />}
        {currentView === AppView.PROJECTS && <ProjectsView projects={projects} onSelect={setSelectedProject} />}
      </div>

      {selectedProject && <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </div>
  );
}