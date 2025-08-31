
import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// IMPORTANT: This is a simplified example. In a production environment,
// you would need to add robust security checks to ensure only authorized users
// can execute these commands. This could involve checking for a valid session,
// user roles, etc., by using something like `next-auth` or Firebase Auth.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const command = body.command;

    let execCommand: string;

    switch (command) {
      case 'install':
        execCommand = 'npm install';
        break;
      case 'lint':
        execCommand = 'npm run lint';
        break;
      default:
        return NextResponse.json({ error: 'Invalid command provided.' }, { status: 400 });
    }

    // Execute the command in the project's root directory
    const { stdout, stderr } = await execAsync(execCommand, { cwd: process.cwd() });

    if (stderr) {
      // Some commands (like npm install) output warnings to stderr that aren't fatal errors.
      // You might want to handle this differently based on the command.
      console.warn(`Stderr from 'npm ${command}':`, stderr);
    }
    
    console.log(`Stdout from 'npm ${command}':`, stdout);

    return NextResponse.json({
      message: `Command 'npm ${command}' executed successfully.`,
      stdout,
      stderr,
    });
  } catch (error: any) {
    console.error(`Error executing command:`, error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
  }
}
