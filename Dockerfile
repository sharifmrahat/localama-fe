FROM oven/bun:latest

WORKDIR /app

COPY package*.json bun.lockb* ./
RUN bun install

COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev", "--", "--host", "0.0.0.0", "--port", "3000"]
