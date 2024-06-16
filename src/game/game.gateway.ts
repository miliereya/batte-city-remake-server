import {
	ConnectedSocket,
	MessageBody,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from '@nestjs/websockets'
import { GameService } from './game.service'
import { Server, Socket } from 'socket.io'
import { GAME_ACTIONS, LOBBY_ACTIONS } from './constants'
import { CreateLobbyDto, InputDto } from './dto'

@WebSocketGateway({
	cors: {
		credentials: true,
		origin: 'https://battle-city-remake.online',
	},
})
export class GameGateway {
	constructor(private readonly gameService: GameService) {}

	@WebSocketServer()
	server: Server

	@SubscribeMessage(LOBBY_ACTIONS.CREATE)
	createLobby(
		@ConnectedSocket() p1: Socket,
		@MessageBody() dto: CreateLobbyDto
	) {
		return this.gameService.createLobby({
			...dto,
			p1,
		})
	}

	@SubscribeMessage(LOBBY_ACTIONS.JOIN)
	joinLobby(@ConnectedSocket() p2: Socket, @MessageBody() id: string) {
		return this.gameService.joinLobby({ p2, id }, this.server)
	}

	@SubscribeMessage(LOBBY_ACTIONS.DELETE)
	deleteLobby(@MessageBody() id: string) {
		this.gameService.deleteLobby(id)
	}

	@SubscribeMessage(GAME_ACTIONS.INPUT)
	input(@ConnectedSocket() player: Socket, @MessageBody() dto: InputDto) {
		this.gameService.input({ ...dto, player: player.id })
	}
}
