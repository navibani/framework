import { spawn, ChildProcess } from 'child_process';
import { watch } from 'fs';
import { resolve } from 'path';

type DevOptions = {
  command: string; // e.g. "npx tsc"
  serverPath: string; // e.g. "src/server/server.js"
  watchDir: string; // e.g. "src"
  debounceMs?: number; // delay before restart (default 500ms)
};

class DevServer {
  private command: string;
  private serverPath: string;
  private watchDir: string;
  private debounceMs: number;
  private serverProcess: ChildProcess | null = null;
  private watchTimeout: NodeJS.Timeout | null = null;
  private isRestarting = false;

  constructor(options: DevOptions) {
    this.command = options.command;
    this.serverPath = resolve(options.serverPath);
    this.watchDir = resolve(options.watchDir);
    this.debounceMs = options.debounceMs || 500;
  }

  private log(message: string) {
    console.log(`[DEV] ${new Date().toLocaleTimeString()} - ${message}`);
  }

  private async runCommand(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.log(`Running command: ${this.command}`);

      const [cmd, ...args] = this.command.split(' ');
      const proc = spawn(cmd, args, {
        stdio: 'inherit',
        shell: true,
      });

      proc.on('close', (code) => {
        if (code === 0) {
          this.log(`Command completed successfully`);
          resolve();
        } else {
          this.log(`Command failed with code ${code}`);
          reject(new Error(`Command failed: ${this.command}`));
        }
      });

      proc.on('error', (err) => {
        this.log(`Command error: ${err.message}`);
        reject(err);
      });
    });
  }

  private startServer(): void {
    this.log(`Starting server: ${this.serverPath}`);

    this.serverProcess = spawn('node', [this.serverPath], {
      stdio: 'inherit',
      shell: true,
    });

    this.serverProcess.on('close', (code) => {
      this.log(`Server process exited with code ${code}`);
      this.serverProcess = null;
    });

    this.serverProcess.on('error', (err) => {
      this.log(`Server error: ${err.message}`);
      this.serverProcess = null;
    });
  }

  private stopServer(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.serverProcess) {
        resolve();
        return;
      }

      this.log('Stopping server...');

      const killTimeout = setTimeout(() => {
        this.log('Force killing server process');
        this.serverProcess?.kill('SIGKILL');
        resolve();
      }, 5000);

      this.serverProcess.on('exit', () => {
        clearTimeout(killTimeout);
        this.serverProcess = null;
        resolve();
      });

      this.serverProcess.kill('SIGTERM');
    });
  }

  private async restart(): Promise<void> {
    if (this.isRestarting) {
      this.log('Restart already in progress, ignoring file change');
      return;
    }

    this.isRestarting = true;

    try {
      await this.stopServer();
      this.log('Server stopped, recompiling...');
      await this.runCommand();
      this.startServer();
    } catch (err) {
      this.log(`Error during restart: ${(err as Error).message}`);
    } finally {
      this.isRestarting = false;
    }
  }

  private setupFileWatcher(): void {
    this.log(`Watching directory: ${this.watchDir}`);

    const watcher = watch(
      this.watchDir,
      { recursive: true },
      async (eventType, filename) => {
        if (!filename) return;

        // Ignore node_modules, dist, .git, etc.
        const ignorePatterns = ['node_modules', 'dist', '.git', '.js'];
        if (ignorePatterns.some((p) => filename.includes(p))) {
          return;
        }

        this.log(`File changed: ${filename}`);

        // Debounce rapid file changes
        if (this.watchTimeout) clearTimeout(this.watchTimeout);
        this.watchTimeout = setTimeout(() => {
          this.restart();
        }, this.debounceMs);
      }
    );

    // Handle watcher errors
    watcher.on('error', (err) => {
      this.log(`Watcher error: ${err.message}`);
    });
  }

  async start(): Promise<void> {
    this.log('Starting dev server...');

    try {
      // Run initial build command
      await this.runCommand();

      // Start the server
      this.startServer();

      // Setup file watcher
      this.setupFileWatcher();

      this.log('Dev server ready. Watching for changes...');

      // Handle graceful shutdown
      process.on('SIGINT', async () => {
        this.log('SIGINT received, shutting down gracefully...');
        await this.stopServer();
        process.exit(0);
      });

      process.on('SIGTERM', async () => {
        this.log('SIGTERM received, shutting down gracefully...');
        await this.stopServer();
        process.exit(0);
      });
    } catch (err) {
      this.log(`Failed to start dev server: ${(err as Error).message}`);
      process.exit(1);
    }
  }
}

// Usage example
if (require.main === module) {
  const devServer = new DevServer({
    command: 'npx tsc -p tsconfig.json',
    serverPath: 'src/server/server.js',
    watchDir: 'src',
    debounceMs: 500,
  });
