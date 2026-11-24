#!/usr/bin/env bash
# Archives this worktree: stops the servers running from it, then removes it. The branch is kept.
# Usage: scripts/archive-workspace.sh [--yes]
set -euo pipefail

# Processes listening on a TCP port whose working directory is inside the worktree.
# Found by directory, not by port: the same port number could belong to another worktree.
server_pids() {
	lsof -nP -iTCP -sTCP:LISTEN -Fp 2>/dev/null | sed -n 's/^p//p' | sort -u | while IFS= read -r pid; do
		cwd="$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p')"
		case "$cwd/" in "$1"/*) echo "$pid" ;; esac
	done
}

stop() {
	kill "$@" 2>/dev/null || true
	for _ in $(seq 10); do
		local alive=()
		for pid in "$@"; do kill -0 "$pid" 2>/dev/null && alive+=("$pid"); done
		[ ${#alive[@]} -eq 0 ] && return
		sleep 0.5
	done
	kill -9 "${alive[@]}" 2>/dev/null || true
}

archive() {
	local root main branch dirty answer
	root="$(cd "$(git rev-parse --show-toplevel)" && pwd -P)"
	main="$(cd "$(git worktree list --porcelain | sed -n '1s/^worktree //p')" && pwd -P)"
	branch="$(git branch --show-current)"

	if [ "$root" = "$main" ]; then
		echo "This is the main checkout: nothing to archive." >&2
		exit 1
	fi

	dirty="$(git status --porcelain)"
	if [ -n "$dirty" ]; then
		echo "This worktree has uncommitted changes. Commit or stash them first:" >&2
		echo "$dirty" >&2
		exit 1
	fi

	local pids=()
	while IFS= read -r pid; do pids+=("$pid"); done < <(server_pids "$root")

	echo "Worktree  $root"
	echo "Branch    ${branch:-detached HEAD} (kept)"
	if [ ${#pids[@]} -gt 0 ]; then
		echo "Servers to stop:"
		ps -o pid=,comm= -p "$(IFS=,; echo "${pids[*]}")" | sed -E 's#^ *([0-9]+) .*/#  \1 #'
	else
		echo "Servers   none running"
	fi

	if [ "${1:-}" != "--yes" ]; then
		read -r -p "Archive this worktree? [y/N] " answer || true
		if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
			echo "Nothing changed."
			exit 1
		fi
	fi

	if [ ${#pids[@]} -gt 0 ]; then stop "${pids[@]}"; fi
	git -C "$main" worktree remove "$root"

	echo "Removed $root"
	[ -n "$branch" ] && echo "Branch $branch is still there."
	echo "Main checkout: $main"
}

# Called last: bash reads a script as it runs, and this file is deleted with the worktree.
archive "$@"
