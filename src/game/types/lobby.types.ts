import { Socket } from 'socket.io'
import { EditorObject, Game, GameSettings } from '../engine'

export interface Lobby {
	id: string
	p1: Socket
	settings: GameSettings
	expireMinute: number
	editor?: EditorObject[]
}

export interface LobbyManager {
	[key: string]: Lobby
}

export interface GameManager {
	[key: string]: Game
}
