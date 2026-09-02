#!/usr/bin/env bash

set -euo pipefail

plugin_slug="od-html-toolkit"
project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
release_tag="${1:-}"
plugin_version="$(sed -n 's/^ \* Version:[[:space:]]*//p' "${project_root}/od-html-toolkit.php" | head -n 1)"

if [[ -n "${release_tag}" && "${release_tag#v}" != "${plugin_version}" ]]; then
	echo "Release tag ${release_tag} does not match plugin version ${plugin_version}." >&2
	exit 1
fi

build_root="$(mktemp -d)"
cleanup() {
	rm -rf "${build_root}"
}
trap cleanup EXIT

mkdir -p "${build_root}/${plugin_slug}" "${project_root}/dist"
rsync -a --exclude-from="${project_root}/.distignore" "${project_root}/" "${build_root}/${plugin_slug}/"

composer install \
	--working-dir="${build_root}/${plugin_slug}" \
	--no-dev \
	--prefer-dist \
	--no-interaction \
	--no-progress \
	--optimize-autoloader

rm -f "${build_root}/${plugin_slug}/composer.json" "${build_root}/${plugin_slug}/composer.lock"

rm -f "${project_root}/dist/${plugin_slug}.zip"
(
	cd "${build_root}"
	zip -qr "${project_root}/dist/${plugin_slug}.zip" "${plugin_slug}"
)

echo "Created dist/${plugin_slug}.zip (${plugin_version})"
