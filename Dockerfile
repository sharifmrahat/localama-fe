FROM oven/bun:latest

WORKDIR /app

COPY package*.json bun.lockb* ./
RUN bun install

COPY . .

# Build the SvelteKit project
RUN bun run build

EXPOSE 3000

# Run vite preview (serves the build)
CMD ["bun", "run", "preview"]
