import { Socket } from 'socket.io'
import { EditorObject, GameSettings } from '../engine'

export interface CreateLobbyDto {
	id: string
	p1: Socket
	settings: GameSettings
	editor?: EditorObject[]
}

export interface JoinLobbyDto {
	id: string
	p2: Socket
}
