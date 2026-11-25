#!/usr/bin/env bash
# Prepares this worktree: copies the local env files from the main checkout,
# then gives it its own API and web ports so several worktrees can run `pnpm dev` at once.
set -euo pipefail

root="$(git rev-parse --show-toplevel)"
# git always lists the main checkout first, whatever tool created the worktree.
main="$(git worktree list --porcelain | sed -n '1s/^worktree //p')"

echo "Env files from $main"
copied=0
if [ "$main" != "$root" ]; then
	while IFS= read -r file; do
		file="${file#./}"
		[ "$(basename "$file")" = ".env.development" ] && continue
		git -C "$main" check-ignore -q "$file" || continue
		if [ -e "$root/$file" ]; then
			echo "  kept    $file (already here)"
		else
			mkdir -p "$(dirname "$root/$file")"
			cp "$main/$file" "$root/$file"
			echo "  copied  $file"
		fi
		copied=$((copied + 1))
	done < <(cd "$main" && find . -maxdepth 3 \( -name node_modules -o -name .git -o -name .venv \) -prune -o -type f -name '.env*' -print)
fi
if [ "$copied" -eq 0 ]; then echo "  nothing to copy"; fi

read_port() { [ -f "$2" ] && sed -n "s/^$1=//p" "$2" | head -1 || true; }

used_ports() {
	git worktree list --porcelain | sed -n 's/^worktree //p' | while IFS= read -r worktree; do
		[ "$worktree" = "$root" ] && continue
		cat "$worktree"/apps/server/.env.development "$worktree"/apps/web/.env.development 2>/dev/null || true
	done | sed -nE 's/^(SERVER|WEB)_PORT=([0-9]+)$/\2/p'
}

pick_port() {
	local min=$1 max=$2 used port
	used="$(used_ports)"
	for _ in $(seq 100); do
		port=$((min + RANDOM % (max - min)))
		grep -qx "$port" <<<"$used" && continue
		lsof -nP -iTCP:"$port" -sTCP:LISTEN >/dev/null 2>&1 && continue
		echo "$port"
		return
	done
	echo "No free port between $min and $max" >&2
	exit 1
}

server_port="$(read_port SERVER_PORT "$root/apps/server/.env.development")"
web_port="$(read_port WEB_PORT "$root/apps/web/.env.development")"
server_port="${server_port:-$(pick_port 3001 4000)}"
web_port="${web_port:-$(pick_port 5174 6000)}"

cat >"$root/apps/server/.env.development" <<EOF
# Written by scripts/setup-workspace.sh, ports of this worktree.
SERVER_PORT=$server_port
CORS_ORIGIN=http://localhost:$web_port
EOF

cat >"$root/apps/web/.env.development" <<EOF
# Written by scripts/setup-workspace.sh, ports of this worktree.
WEB_PORT=$web_port
VITE_SERVER_URL=http://localhost:$server_port
EOF

echo "Ports"
echo "  API  http://localhost:$server_port"
echo "  Web  http://localhost:$web_port"
