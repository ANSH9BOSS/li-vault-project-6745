
import { User, FileNode } from '../types.ts';

function toBase64(str: string): string {
  try {
    const bytes = new TextEncoder().encode(str);
    const binString = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
    return btoa(binString);
  } catch (err) {
    console.error('Base64 encoding failed:', err);
    return '';
  }
}

/**
 * Creates a new repository and uploads all workspace files.
 */
export async function deployProjectToGitHub(user: User, files: FileNode[], projectName: string) {
  if (!user.accessToken || user.provider !== 'github') {
    throw new Error('Neural Handshake Failed: Valid GitHub token required.');
  }

  const token = user.accessToken;
  const repoName = projectName.replace(/\s+/g, '-').toLowerCase() || `li-vault-project-${Date.now()}`;

  try {
    // 1. Create Repository
    const createRes = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: repoName,
        description: 'Deployed via LI HUB ULTIMATE | Polyglot Workspace by Li',
        private: false,
        auto_init: true
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.message || 'Repo creation blocked by GitHub API.');
    }

    const repoData = await createRes.json();
    const owner = repoData.owner.login;

    // 2. Upload Files
    for (const file of files) {
      if (!file.content) continue;
      const path = file.name;
      const content = toBase64(file.content);

      await fetch(`https://api.github.com/repos/${owner}/${repoName}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({
          message: `Li Hub Sync: ${file.name}`,
          content: content
        })
      });
    }

    return { success: true, url: repoData.html_url, name: repoName };
  } catch (err: any) {
    console.error('GitHub Deploy Error:', err);
    throw err;
  }
}

/**
 * Fetches files from a public GitHub repository recursively.
 */
export async function importFromGitHub(repoPath: string): Promise<FileNode[]> {
  const fileNodes: FileNode[] = [];
  
  async function fetchPath(path: string = '') {
    const url = `https://api.github.com/repos/${repoPath}/contents/${path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Path ${path} not found or rate limited.`);
    
    const items = await res.json();
    const itemsArray = Array.isArray(items) ? items : [items];

    for (const item of itemsArray) {
      if (item.type === 'file') {
        const fileRes = await fetch(item.download_url);
        const content = await fileRes.text();
        const ext = item.name.split('.').pop() || '';
        const langMap: any = { 
          py: 'python', js: 'javascript', ts: 'typescript', css: 'css', 
          html: 'html', md: 'markdown', sh: 'shell', java: 'java', 
          rust: 'rust', yml: 'yaml', tsx: 'typescript', jsx: 'javascript', json: 'json' 
        };
        
        fileNodes.push({
          id: Math.random().toString(36).substr(2, 9),
          name: item.path, // Use full path to preserve structure if possible
          language: langMap[ext] || 'plaintext',
          content,
          isOpen: true
        });
      } else if (item.type === 'dir') {
        await fetchPath(item.path);
      }
    }
  }

  await fetchPath();
  return fileNodes;
}
