import { NestFactory } from '@nestjs/core'
import { GameModule } from './game/game.module'

async function bootstrap() {
	const game = await NestFactory.create(GameModule)
	await game.listen(3000)
}
bootstrap()
