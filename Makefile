.PHONY: up down dev migrate generate db-push studio all

# Levantar la base de datos en Docker (en segundo plano)
up:
	docker compose up -d
	@echo "Esperando a que la base de datos inicie..."
	sleep 3

# Bajar la base de datos en Docker
down:
	docker compose down

# Ejecutar migraciones para sincronizar el esquema con la base de datos
migrate:
	pnpm exec prisma migrate dev --name init

# Empujar los cambios del esquema sin crear historial de migraciones (para prototipado rápido)
db-push:
	pnpm exec prisma db push

# Generar el cliente de Prisma luego de cambiar el schema.prisma
generate:
	pnpm exec prisma generate

# Levantar el entorno de desarrollo (Node.js + nodemon + tsx)
dev:
	pnpm exec nodemon --watch 'src/**/*.ts' --exec 'tsx' src/index.ts

# Abrir Prisma Studio (Interfaz gráfica para ver los datos de la base de datos)
studio:
	pnpm exec prisma studio

# Ejecutar pruebas automatizadas con Jest
test:
	pnpm exec jest

# Comando principal para la primera vez: levanta DB, espera, migra y lanza el servidor dev
all: up migrate dev
