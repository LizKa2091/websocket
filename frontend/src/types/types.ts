export type Message = 
  | { type: 'create' }
  | { type: 'join', roomId: string }
  | { type: 'created', roomId: string }
  | { type: 'joined', roomId: string }
  | { type: 'user_joined' }
  | { type: 'user_left' }
  | { type: 'error', message: string };