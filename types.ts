
export interface Project {
  id: string;
  title: string;
  type: 'image' | 'code' | 'video' | '3d' | 'audio';
  content: string; // URL or Code snippet
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  IMAGE_STUDIO = 'IMAGE_STUDIO', // Logo, Thumbnail, BG Remove, Style Transfer
  CODE_DEV = 'CODE_DEV', // Website, Games
  THREE_D_STUDIO = 'THREE_D_STUDIO', // Text to Video
  CGI_STUDIO = 'CGI_STUDIO', // CGI Ad Feature
  TTS_STUDIO = 'TTS_STUDIO', // Text to Speech
  CHAT_HELPER = 'CHAT_HELPER', // AI Assistant (Text & Voice)
  PROJECTS = 'PROJECTS'
}

export interface User {
  username: string;
  email: string;
}
