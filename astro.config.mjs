import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  site: 'https://docs.narratorr.dev',
  integrations: [
    starlight({
      title: 'narratorr',
      logo: {
        src: './src/assets/logo.svg',
      },
      head: [
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.ico', sizes: '48x48' } },
        { tag: 'link', attrs: { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' } },
      ],
      customCss: ['./src/styles/custom.css'],
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/todd/narratorr' },
      ],
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            { label: 'Installation', slug: 'getting-started/installation' },
            { label: 'First Run Setup', slug: 'getting-started/first-run' },
            { label: 'Common Setups', slug: 'getting-started/common-setups' },
          ],
        },
        {
          label: 'Configuration',
          items: [
            { label: 'Settings Overview', slug: 'configuration/settings' },
            { label: 'Indexers', slug: 'configuration/indexers' },
            { label: 'Download Clients', slug: 'configuration/download-clients' },
            { label: 'Library & Folders', slug: 'configuration/library' },
            { label: 'Notifications', slug: 'configuration/notifications' },
            { label: 'Security & Auth', slug: 'configuration/security' },
            { label: 'Environment Variables', slug: 'configuration/environment-variables' },
          ],
        },
        {
          label: 'Features',
          items: [
            { label: 'Discovery & Recommendations', slug: 'guides/discovery' },
            { label: 'Quality Gates', slug: 'guides/quality-gates' },
            { label: 'Import Lists', slug: 'guides/import-lists' },
            { label: 'RSS Feeds', slug: 'guides/rss-feeds' },
            { label: 'Manual Import', slug: 'guides/manual-import' },
            { label: 'Blacklist', slug: 'guides/blacklist' },
            { label: 'Recycling Bin', slug: 'guides/recycling-bin' },
            { label: 'Tagging & Cover Art', slug: 'guides/tagging' },
            { label: 'Backup & Restore', slug: 'guides/backup-restore' },
            { label: 'Features Reference', slug: 'guides/features' },
          ],
        },
        {
          label: 'Guides',
          items: [
            { label: 'Folder Format Tokens', slug: 'guides/folder-format' },
            { label: 'Docker', slug: 'guides/docker' },
            { label: 'Remote Path Mappings', slug: 'guides/remote-path-mappings' },
            { label: 'Audio Processing', slug: 'guides/audio-processing' },
          ],
        },
        { label: 'Troubleshooting', slug: 'troubleshooting' },
      ],
    }),
  ],
});
