import { Injectable } from '@nestjs/common'
import { GameManager, Lobby, LobbyManager } from './types'
import { CreateLobbyDto, InputDto, JoinLobbyDto } from './dto'
import { SETTINGS } from './config'
import { GAME_ACTIONS, GAME_RESPONSES, LOBBY_RESPONSES } from './constants'
import { Server } from 'socket.io'
import { Game, gameFrame } from './engine'

@Injectable()
export class GameService {
	lobbyManager: LobbyManager = {}
	gameManager: GameManager = {}

	createLobby(dto: CreateLobbyDto) {
		if (this.lobbyManager[dto.id]) return

		const lobby = {
			...dto,
			expireMinute: SETTINGS.LOBBY_EXPIRE_MINUTES,
		}

		this.lobbyManager[`id${lobby.id}`] = lobby
		setTimeout(
			() => {
				this.deleteLobby(lobby.id)
			},
			SETTINGS.LOBBY_EXPIRE_MINUTES * 1000 * 60
		)

		return LOBBY_RESPONSES.LOBBY_CREATED
	}

	joinLobby(dto: JoinLobbyDto, server: Server) {
		const lobby = this.lobbyManager[`id${dto.id}`]

		if (!lobby) {
			return LOBBY_RESPONSES.NOT_FOUND
		}

		lobby.p1.join(lobby.id)
		dto.p2.join(lobby.id)

		this.startGame(lobby, dto.p2.id, server)
	}

	deleteLobby(name: string) {
		delete this.lobbyManager[name]
	}

	startGame(lobby: Lobby, p2: string, server: Server) {
		const game = new Game(
			lobby.id,
			lobby.p1.id,
			p2,
			lobby.settings,
			lobby.editor
		)
		this.gameManager[game.id] = game
		this.deleteLobby(lobby.id)

		this.frame(game, server)
	}

	frame(game: Game, server: Server) {
		const startTime = new Date().getTime()
		gameFrame(game)

		const { id, isEnded } = game

		server.to(id).emit(GAME_ACTIONS.FRAME, { game })

		if (isEnded) {
			delete this.gameManager[id]
			server.to(id).emit(GAME_ACTIONS.ENDED, GAME_RESPONSES.GAME_ENDED)
		} else {
			setTimeout(
				() => this.frame(game, server),
				22 - (new Date().getTime() - startTime)
			)
		}
	}

	input(dto: InputDto) {
		const game = this.gameManager[dto.gameId]
		if (!game) return

		const playerController =
			dto.player === game.p1.id ? game.p1Controls : game.p2Controls
		const { button } = dto

		switch (button) {
			case 'TOP':
			case 'RIGHT':
			case 'LEFT':
			case 'BOTTOM':
				playerController.move = button
				break
			case 'FIRE':
				playerController.fire = true
				break
			case 'PAUSE':
				playerController.pause = true
				break
			default:
				break
		}
	}
}
