function initTerminal() {
    if (document.getElementById('portfolio-terminal-widget')) return;

    // 1. Inject HTML for the Terminal Widget
    const terminalHTML = `
        <div id="portfolio-terminal-widget" class="terminal-widget-container">
            <button id="terminal-toggle-btn" class="terminal-toggle-btn" title="Open Terminal">
                <i class="fas fa-terminal"></i>
            </button>
            <div id="terminal-window" class="terminal-window hidden">
                <div class="terminal-header" id="terminal-header">
                    <div class="terminal-buttons">
                        <span class="terminal-btn close" id="terminal-close-btn"></span>
                        <span class="terminal-btn minimize" id="terminal-min-btn"></span>
                        <span class="terminal-btn maximize" id="terminal-theme-btn" title="Toggle Theme"></span>
                    </div>
                    <div class="terminal-title">guest@portfolio: ~</div>
                </div>
                <div class="terminal-body" id="terminal-body">
                    <div class="terminal-output" id="terminal-output">
                    </div>
                    <div class="terminal-input-line" id="terminal-input-wrapper" style="display:none;">
                        <span class="terminal-prompt" id="terminal-prompt-prefix">guest@portfolio:~$</span>
                        <input type="text" id="terminal-input" class="terminal-input" autocomplete="off" spellcheck="false">
                    </div>
                </div>
            </div>
        </div>
        <canvas id="matrix-canvas" class="matrix-hidden"></canvas>
    `;

    document.body.insertAdjacentHTML('beforeend', terminalHTML);

    const toggleBtn = document.getElementById('terminal-toggle-btn');
    const closeBtn = document.getElementById('terminal-close-btn');
    const minBtn = document.getElementById('terminal-min-btn');
    const themeBtn = document.getElementById('terminal-theme-btn');
    const terminalWindow = document.getElementById('terminal-window');
    const terminalHeader = document.getElementById('terminal-header');
    const terminalInput = document.getElementById('terminal-input');
    const terminalInputWrapper = document.getElementById('terminal-input-wrapper');
    const terminalOutput = document.getElementById('terminal-output');
    const terminalBody = document.getElementById('terminal-body');
    const promptPrefixEl = document.getElementById('terminal-prompt-prefix');
    const matrixCanvas = document.getElementById('matrix-canvas');

    let isTyping = false;
    let commandHistory = [];
    let historyIndex = -1;
    let hasBooted = false;

    // --- State Variables ---
    let inGame = false, gameType = '';

    // --- Dragging Logic (Optimized) ---
    let isDragging = false, dragOffsetX = 0, dragOffsetY = 0;
    
    function onMouseMove(e) {
        if (!isDragging) return;
        terminalWindow.style.left = (e.clientX - dragOffsetX) + 'px';
        terminalWindow.style.top = (e.clientY - dragOffsetY) + 'px';
        terminalWindow.style.bottom = 'auto'; 
        terminalWindow.style.right = 'auto';
    }

    function onMouseUp() {
        if (isDragging) {
            isDragging = false; 
            terminalWindow.classList.remove('is-dragging');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        }
    }

    terminalHeader.addEventListener('mousedown', (e) => {
        isDragging = true; 
        terminalWindow.classList.add('is-dragging');
        const rect = terminalWindow.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left; 
        dragOffsetY = e.clientY - rect.top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // File system has been optimized out since commands like cd/cat were removed.
    
    function updatePrompt() {
        if (inGame && gameType === 'snake') promptPrefixEl.textContent = 'snake> ';
        else {
            promptPrefixEl.textContent = `guest@portfolio:~$ `;
            document.querySelector('.terminal-title').textContent = `guest@portfolio: ~`;
        }
    }

    // --- Audio System ---
    let audioCtx = null;
    function playTerminalClack() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(100 + Math.random()*50, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.02, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.05);
    }

    async function typeHTML(element, htmlString, speed = 15) {
        let currentHTML = ""; let i = 0;
        while (i < htmlString.length) {
            if (htmlString[i] === '<') {
                let tag = '';
                while (htmlString[i] !== '>' && i < htmlString.length) { tag += htmlString[i]; i++; }
                tag += '>'; currentHTML += tag; i++;
            } else {
                currentHTML += htmlString[i];
                element.innerHTML = currentHTML; i++;
                terminalBody.scrollTop = terminalBody.scrollHeight;
                await new Promise(r => setTimeout(r, speed + (Math.random() * 10 - 5)));
            }
        }
        element.innerHTML = htmlString;
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    // --- Boot Sequence ---
    async function bootSequence() {
        hasBooted = true;
        terminalInputWrapper.style.display = 'none';
        terminalOutput.innerHTML = '';
        const bootText = [
            "Initializing AbdulOS v1.0.4..."
        ];
        for (let line of bootText) {
            const div = document.createElement('div');
            div.className = 'cmd-response'; div.style.color = '#ccc';
            terminalOutput.appendChild(div);
            await typeHTML(div, line, 10);
            await new Promise(r => setTimeout(r, 100));
        }
        terminalOutput.innerHTML += `
            <p class="terminal-welcome" style="margin-top:1rem;">Welcome to Abdul Mutallif's Portfolio Terminal.</p>
            <p class="terminal-welcome">Type <span class="cmd-highlight">help</span> to see available commands.</p>
        `;
        terminalInputWrapper.style.display = 'flex';
        terminalInput.focus();
    }

    // --- Basic UI ---
    function openTerminal() {
        terminalWindow.classList.remove('hidden');
        setTimeout(() => {
            terminalWindow.classList.add('active');
            if (!hasBooted) bootSequence();
            else terminalInput.focus();
        }, 10);
    }
    function closeTerminal() {
        terminalWindow.classList.remove('active');
        setTimeout(() => terminalWindow.classList.add('hidden'), 300);
    }

    toggleBtn.addEventListener('click', () => {
        if (terminalWindow.classList.contains('active')) closeTerminal();
        else openTerminal();
    });
    closeBtn.addEventListener('click', closeTerminal);
    minBtn.addEventListener('click', closeTerminal);
    themeBtn.addEventListener('click', () => terminalWindow.classList.toggle('light-theme'));
    terminalBody.addEventListener('click', () => { if (!isTyping) terminalInput.focus(); });

    // --- Complex Scripts ---
    function startMatrix() {
        matrixCanvas.classList.remove('matrix-hidden');
        const ctx = matrixCanvas.getContext('2d');
        matrixCanvas.width = window.innerWidth; matrixCanvas.height = window.innerHeight;
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*]*'.split('');
        const fontSize = 16; const columns = matrixCanvas.width / fontSize;
        const drops = Array(Math.floor(columns)).fill(1);
        const matrixInterval = setInterval(() => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; ctx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
            ctx.fillStyle = '#0F0'; ctx.font = fontSize + 'px monospace';
            for (let i = 0; i < drops.length; i++) {
                const text = letters[Math.floor(Math.random() * letters.length)];
                ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                if (drops[i] * fontSize > matrixCanvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            }
        }, 33);
        const stopMatrix = () => {
            clearInterval(matrixInterval); matrixCanvas.classList.add('matrix-hidden');
            document.removeEventListener('keydown', stopMatrix); document.removeEventListener('click', stopMatrix);
        };
        setTimeout(() => { document.addEventListener('keydown', stopMatrix); document.addEventListener('click', stopMatrix); }, 500);
    }

    let snakeLoop = null, snakeDir = {x:1,y:0}, snakeBody = [], food = {}, isGameOver = false;
    function startSnake(responseLine) {
        snakeBody = [{x:10,y:5}, {x:9,y:5}, {x:8,y:5}]; food = {x:15,y:5}; snakeDir = {x:1,y:0}; isGameOver = false;
        const W=20, H=10;
        const render = () => {
            let text = '+' + '-'.repeat(W) + '+\n';
            for(let y=0; y<H; y++){
                text += '|';
                for(let x=0; x<W; x++){
                    if(x===food.x && y===food.y) text += '<span style="color:#ff5f56">❤</span>';
                    else if(snakeBody[0].x===x && snakeBody[0].y===y) text += '<span style="color:#27c93f">■</span>';
                    else if(snakeBody.some(s=>s.x===x && s.y===y)) text += '<span style="color:#1d972e">■</span>';
                    else text += ' ';
                }
                text += '|\n';
            }
            text += '+' + '-'.repeat(W) + '+';
            if (isGameOver) responseLine.innerHTML = `<pre style="font-family:monospace;margin:0;line-height:1.2;font-size:14px;">${text}</pre><div class="cmd-response cmd-error" style="font-weight:bold;">GAME OVER - Score: ${snakeBody.length-3}</div><div class="cmd-response">Type 'play snake' to restart, or 'exit' to quit.</div>`;
            else responseLine.innerHTML = `<pre style="font-family:monospace;margin:0;line-height:1.2;font-size:14px;">${text}</pre><div class="cmd-response">Score: ${snakeBody.length-3} | Use WASD or Arrow Keys. 'exit' to quit.</div>`;
            terminalBody.scrollTop = terminalBody.scrollHeight;
        };
        render();
        snakeLoop = setInterval(() => {
            if(isGameOver) return;
            const head = {x: snakeBody[0].x+snakeDir.x, y: snakeBody[0].y+snakeDir.y};
            if(head.x<0 || head.x>=W || head.y<0 || head.y>=H || snakeBody.some(s=>s.x===head.x&&s.y===head.y)){
                clearInterval(snakeLoop); snakeLoop = null; isGameOver = true;
                inGame = false; gameType=''; updatePrompt(); terminalInput.disabled=false; terminalInput.focus();
                render(); return;
            }
            snakeBody.unshift(head);
            if(head.x===food.x && head.y===food.y) {
                while(true) { food = {x: Math.floor(Math.random()*W), y: Math.floor(Math.random()*H)}; if(!snakeBody.some(s=>s.x===food.x && s.y===food.y)) break; }
            } else snakeBody.pop();
            render();
        }, 120);
    }

    const BLOG_POSTS = [
        {
            title: "how-i-built-this-terminal",
            date: "June 18, 2026",
            tags: "JavaScript, UI/UX",
            content: "Building this terminal was a fantastic exercise in DOM manipulation and simulated physics. I wanted to create an experience that felt like a real Linux machine, complete with boot sequences, tab autocomplete, and hidden easter eggs! The hardest part was getting the custom physics gravity engine to work on DOM elements."
        },
        {
            title: "my-journey-with-react",
            date: "May 12, 2026",
            tags: "React, Frontend",
            content: "React fundamentally changed how I think about building UI components. Coming from vanilla HTML/JS, grasping the component lifecycle and state management took a moment, but once it clicked during my internship at IBM SkillsBuild, it became my go-to framework for any scalable frontend project."
        },
        {
            title: "the-future-of-web-dev",
            date: "April 04, 2026",
            tags: "Thoughts, Tech",
            content: "With the rise of AI tools, the landscape of web development is shifting. We are moving from writing boilerplate code to architecting complex systems and focusing deeply on User Experience. Beautiful, interactive designs (like this terminal!) will become the primary way developers stand out."
        }
    ];

    const DEV_QUOTES = [
        '"Talk is cheap. Show me the code." - Linus Torvalds',
        '"Programs must be written for people to read, and only incidentally for machines to execute." - Harold Abelson',
        '"Always code as if the guy who ends up maintaining your code will be a violent psychopath who knows where you live." - John Woods',
        '"Any fool can write code that a computer can understand. Good programmers write code that humans can understand." - Martin Fowler',
        '"Truth can only be found in one place: the code." - Robert C. Martin',
        '"If, at first, you do not succeed, call it version 1.0." - Khayri R.R. Woulfe',
        '"It’s not a bug. It’s an undocumented feature!" - Anonymous',
        '"First, solve the problem. Then, write the code." - John Johnson'
    ];

    // --- Core Parser ---
    async function processCommand(cmdString) {
        if (isTyping) return;
        const cmd = cmdString.trim();
        const cmdLower = cmd.toLowerCase();
        const args = cmd.split(' ').filter(Boolean);
        const baseCmd = args[0] ? args[0].toLowerCase() : '';

        if (cmd && !inGame) {
            commandHistory.push(cmdString); historyIndex = commandHistory.length;
        }

        const echoLine = document.createElement('div');
        echoLine.className = 'terminal-echo';
        echoLine.innerHTML = `<span class="terminal-prompt">${promptPrefixEl.textContent}</span> ${cmdString}`;
        terminalOutput.appendChild(echoLine);
        terminalInput.value = '';
        terminalBody.scrollTop = terminalBody.scrollHeight;

        if (!cmd) return;

        isTyping = true;
        terminalInput.disabled = true;

        const responseLine = document.createElement('div');
        terminalOutput.appendChild(responseLine);

        // --- GAME STATE ---
        if (inGame) {
            if (cmdLower === 'exit' || cmdLower === 'quit') {
                inGame = false; if(gameType==='snake') { clearInterval(snakeLoop); snakeLoop=null; }
                gameType = ''; await typeHTML(responseLine, '<div class="cmd-response">Exited game.</div>'); updatePrompt();
            } else if (gameType === 'snake') {
                if (isGameOver && cmdLower === 'play snake') { isGameOver = false; startSnake(responseLine); } 
                else responseLine.innerHTML = '<div class="cmd-response">Use Arrow Keys/WASD to move! Type "exit" to quit.</div>';
            }
            isTyping = false; terminalInput.disabled = false; terminalInput.focus(); return;
        }

        // --- NORMAL COMMANDS ---
        if (baseCmd === 'clear') { terminalOutput.innerHTML = ''; } 
        else if (baseCmd === 'help') {
            await typeHTML(responseLine, `
                <div class="cmd-response" style="column-count: 2; column-gap: 20px;">
                    <span class="cmd-highlight">ls</span> - File system<br>
                    <span class="cmd-highlight">date</span> - View date & time<br>
                    <span class="cmd-highlight">ask</span> - Talk to my AI<br>
                    <span class="cmd-highlight">play snake</span> - Play game<br>
                    <span class="cmd-highlight">locate</span> - Network tool<br>
                    <span class="cmd-highlight">clear</span> - Clear screen<br>
                    <span class="cmd-highlight">joke</span> - Programmer humor<br>
                    <span class="cmd-highlight">quote</span> - Random quote<br>
                    <span class="cmd-highlight">sudo</span>, <span class="cmd-highlight">42</span> - Easter eggs<br>
                    <span class="cmd-highlight">blog</span> - List articles<br>
                    <span class="cmd-highlight">read</span> - Read article<br>
                </div>
                <div class="cmd-response" style="margin-top: 10px;">
                    <strong>Shortcuts:</strong> <span class="cmd-highlight">about</span>, <span class="cmd-highlight">skills</span>, <span class="cmd-highlight">projects</span>, <span class="cmd-highlight">resume</span>, <span class="cmd-highlight">experience</span>, <span class="cmd-highlight">education</span>, <span class="cmd-highlight">achievements</span>, <span class="cmd-highlight">contact</span>, <span class="cmd-highlight">github</span>, <span class="cmd-highlight">linkedin</span>
                </div>
            `);
        }
        else if (['about', 'skills', 'projects', 'resume', 'experience', 'education', 'achievements', 'contact'].includes(baseCmd)) {
            let summary = '';
            if(baseCmd === 'about') summary = "I am Abdul Mutallif, a passionate Full Stack Developer and UI/UX Designer.";
            else if(baseCmd === 'skills') summary = "[Frontend]: HTML, CSS, JS, React\n[Backend]: PHP, Node.js, Express\n[Database]: MySQL, MongoDB\n[Tools]: Git, VS Code";
            else if(baseCmd === 'projects') summary = "Featured Projects:\n- FoodLink (Zero waste food sharing)\n- Real-Time Weather App (API integration)\n- Student Management System (CRUD, DB)";
            else if(baseCmd === 'experience') summary = "- Front End Developer Intern @ IBM SkillsBuild & AICTE (2024)\n- Web Dev Trainee @ Internshala (2024)";
            else if(baseCmd === 'education') summary = "Currently pursuing Bachelor of Technology (B.Tech) in Computer Science.";
            else if(baseCmd === 'achievements') summary = "AIR 84 in Coding Ninjas Slayground 2.0 (2024).";
            else if(baseCmd === 'resume') summary = "Opening Resume URL...";
            else if(baseCmd === 'contact') summary = "Email: abdul.mutallif.786@gmail.com\nLinkedIn: linkedin.com/in/abdul-mutallif\nGitHub: github.com/Abdul-Mutallif";
            
            await typeHTML(responseLine, `<div class="cmd-response" style="white-space:pre-wrap; border-left: 2px solid #27c93f; padding-left: 10px;">${summary}</div>`, 5);
            
            // Scroll logic
            if (baseCmd === 'achievements') window.location.href = 'achievements.html';
            else if (baseCmd === 'resume') window.open('https://drive.google.com/file/d/1HAO_YHtcSsAaSt2YCfQnjmiiBF3Z5s3a/view', '_blank');
            else if (baseCmd === 'contact') document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
            else if (baseCmd === 'education' || baseCmd === 'experience') document.querySelector('.about-section')?.scrollIntoView({ behavior: 'smooth' });
            else document.getElementById(baseCmd)?.scrollIntoView({ behavior: 'smooth' });
        }
        else if (baseCmd === 'ask') {
            const query = args.slice(1).join(' ').toLowerCase();
            if(!query) {
                await typeHTML(responseLine, '<div class="cmd-response cmd-error">Usage: ask [your question]</div>');
            } else {
                let reply = "I am Abdul's simulated AI. I can answer questions about his skills, projects, and contact info.";
                if (query.includes('skill') || query.includes('tech')) reply = "Abdul specializes in modern web development using HTML, CSS, JS, React, PHP, and MySQL.";
                if (query.includes('experience') || query.includes('work')) reply = "Abdul recently completed an intensive Frontend Web Development internship with IBM SkillsBuild.";
                if (query.includes('hire') || query.includes('contact') || query.includes('email')) reply = "You can reach Abdul directly at abdul.mutallif.786@gmail.com! He is always open to discussing new opportunities.";
                if (query.includes('project')) reply = "Abdul has built several full-stack applications, including FoodLink (a surplus food sharing platform) and a beautiful real-time weather app.";
                if (query.includes('who are you') || query.includes('name')) reply = "I am the automated assistant representing Abdul Mutallif.";
                await typeHTML(responseLine, `<div class="cmd-response" style="color:#27c93f;"><strong>AI:</strong> ${reply}</div>`);
            }
        }
        else if (baseCmd === 'github') {
            window.open('https://github.com/Abdul-Mutallif', '_blank');
            await typeHTML(responseLine, '<div class="cmd-response">Opening GitHub profile...</div>');
        }
        else if (baseCmd === 'linkedin') {
            window.open('https://linkedin.com/in/abdul-mutallif', '_blank');
            await typeHTML(responseLine, '<div class="cmd-response">Opening LinkedIn profile...</div>');
        }
        else if (baseCmd === 'date' || baseCmd === 'time') {
            await typeHTML(responseLine, `<div class="cmd-response">${new Date().toString()}</div>`);
        }
        else if (baseCmd === 'ls') {
            await typeHTML(responseLine, `
                <div class="cmd-response" style="line-height: 1.8;">
                    <span style="color:#3b8eea; margin-right: 15px;">projects/</span>
                    <span style="color:#3b8eea; margin-right: 15px;">achievements/</span>
                    <span style="color:#ccc; margin-right: 15px;">resume.pdf</span><br>
                    <span style="color:#ccc; margin-right: 15px;">skills.json</span>
                    <span style="color:#ccc; margin-right: 15px;">contact.txt</span>
                </div>
            `);
        }
        else if (baseCmd === 'locate') {
            await typeHTML(responseLine, '<div class="cmd-response">Establishing secure connection...</div>');
            try {
                const res = await fetch('https://ipapi.co/json/'); const data = await res.json();
                if (data.error) throw new Error();
                await typeHTML(responseLine, `<div class="cmd-response" style="color:#27c93f;">IP: ${data.ip}<br>Location: ${data.city}, ${data.country_name}<br>ISP: ${data.org}</div>`, 20);
            } catch (e) { await typeHTML(responseLine, '<div class="cmd-response cmd-error">Failed to trace connection. Proxy detected.</div>'); }
        }
        else if (baseCmd === 'play' && args[1] === 'snake') {
            inGame = true; gameType = 'snake'; updatePrompt(); startSnake(responseLine);
            isTyping = false; terminalInput.disabled = false; terminalInput.focus(); return;
        }
        else if (baseCmd === 'sudo') {
            if (args[1] === 'hire-me') {
                await typeHTML(responseLine, `
                <div class="cmd-response" style="color:#ffbd2e; border: 2px dashed #ffbd2e; padding: 1rem; margin-top: 1rem; margin-bottom: 1rem;">
                    <h3 style="margin-bottom:0.5rem;">🎉 SUDO ACCESS GRANTED! 🎉</h3>
                    <p>You have unlocked the ultimate command. I am currently looking for an amazing team to join.</p>
                    <p>Let's build something great together: <a href="mailto:abdul.mutallif.786@gmail.com" style="color:#fff;text-decoration:underline;">abdul.mutallif.786@gmail.com</a></p>
                </div>`);
            } else {
                await typeHTML(responseLine, `<div class="cmd-response sudo-warning" style="color: #ff5f56; font-weight: bold; text-shadow: 0 0 5px red;">[CRITICAL ALERT] ROOT PRIVILEGES DENIED.</div>`, 30);
                let flashes = 0;
                let flashInt = setInterval(() => {
                    terminalWindow.style.boxShadow = (flashes % 2 === 0) ? 'inset 0 0 50px rgba(255,0,0,0.5)' : 'none';
                    flashes++; if (flashes > 6) { clearInterval(flashInt); terminalWindow.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.5)'; }
                }, 150);
            }
        }
        else if (baseCmd === 'hack') {
            const hackLines = ["Bypassing firewall...", "Decrypting SHA-256...", "Injecting payload...", "ACCESS GRANTED."];
            for (let line of hackLines) {
                const d = document.createElement('div'); d.className='cmd-response'; d.style.color='#27c93f';
                responseLine.appendChild(d); await typeHTML(d, line, 10); await new Promise(r=>setTimeout(r, 200));
            }
        }
        else if (baseCmd === 'matrix') { await typeHTML(responseLine, '<div class="cmd-response">Wake up, Neo...</div>'); setTimeout(startMatrix, 800); }
        else if (baseCmd === 'name' || baseCmd === 'whoami') await typeHTML(responseLine, '<div class="cmd-response">My name is <span class="cmd-highlight">Abdul Mutallif</span>, and I am a <span class="cmd-highlight">Full Stack Web Developer & UI/UX Designer</span>.</div>');
        else if (baseCmd === 'profession' || baseCmd === 'role' || baseCmd === 'job') await typeHTML(responseLine, '<div class="cmd-response">I am a <span class="cmd-highlight">Full Stack Web Developer & UI/UX Designer</span>.</div>');
        else if (baseCmd === '42') await typeHTML(responseLine, '<div class="cmd-response">The answer to life, the universe, and everything.</div>');
        else if (baseCmd === 'coffee') {
            const art = `
      ( (
       ) )
    ........
    |      |]
    \\      /
     \`----'
            `;
            await typeHTML(responseLine, `<pre class="cmd-response" style="color:#c5966a; font-weight:bold;">${art}</pre>`);
        }
        else if (cmdLower === 'joke') {
            await typeHTML(responseLine, `<div class="cmd-response">Why do programmers prefer dark mode? Because light attracts bugs! 🐛👨‍💻</div>`);
        }
        else if (cmdLower === 'quote') {
            await typeHTML(responseLine, `<div class="cmd-response" style="font-style: italic; color: #ffbd2e;">${DEV_QUOTES[Math.floor(Math.random() * DEV_QUOTES.length)]}</div>`);
        }
        else if (cmdLower === 'hi' || cmdLower === 'hello' || cmdLower === 'hey') await typeHTML(responseLine, '<div class="cmd-response">Greetings! Use <span class="cmd-highlight">help</span> to explore.</div>');
        else if (baseCmd === 'blog') {
            let output = '<div class="cmd-response" style="margin-bottom: 1rem;"><strong style="color:#ffbd2e;">Terminal Blog v1.0</strong><br>Type <span class="cmd-highlight">read [number]</span> or <span class="cmd-highlight">read [title]</span> to open an article.</div>';
            BLOG_POSTS.forEach((post, index) => {
                output += `
                    <div class="cmd-response" style="margin-bottom: 0.5rem; padding-left: 10px; border-left: 2px solid #3b8eea;">
                        <span style="color: #3b8eea;">[${index + 1}]</span> <strong style="color: #fff;">${post.title}</strong><br>
                        <span style="color: #888; font-size: 12px;">Date: ${post.date} | Tags: ${post.tags}</span>
                    </div>
                `;
            });
            await typeHTML(responseLine, output, 5);
        }
        else if (baseCmd === 'read') {
            const target = args[1];
            if (!target) {
                await typeHTML(responseLine, '<div class="cmd-response cmd-error">Usage: read [number] or read [title]</div>');
            } else {
                let post = null;
                // Check if target is exclusively a number (prevent '3D rendering' from parsing as 3)
                const num = Number(target);
                if (!isNaN(num) && num > 0 && num <= BLOG_POSTS.length) {
                    post = BLOG_POSTS[num - 1];
                } else {
                    // Try to find by title
                    post = BLOG_POSTS.find(p => p.title.toLowerCase() === target.toLowerCase());
                }

                if (post) {
                    const articleHTML = `
                        <div class="cmd-response" style="border: 1px dashed #666; padding: 1.5rem; margin-top: 1rem; margin-bottom: 1rem; background: rgba(0,0,0,0.2);">
                            <h2 style="color: #ffbd2e; margin-top: 0;">${post.title}</h2>
                            <div style="color: #888; font-size: 12px; margin-bottom: 1.5rem; border-bottom: 1px solid #444; padding-bottom: 0.5rem;">
                                Published: ${post.date} | ${post.tags}
                            </div>
                            <div style="line-height: 1.6; color: #eee;">
                                ${post.content}
                            </div>
                            <div style="margin-top: 1.5rem; text-align: center; color: #666;">***</div>
                        </div>
                    `;
                    await typeHTML(responseLine, articleHTML, 2);
                } else {
                    await typeHTML(responseLine, `<div class="cmd-response cmd-error">Article not found: ${target}. Type <span class="cmd-highlight">blog</span> for a list.</div>`);
                }
            }
        }
        else {
            await typeHTML(responseLine, `<div class="cmd-response cmd-error">Command not found: ${baseCmd}. Type <span class="cmd-highlight">help</span> for a list of commands.</div>`);
        }

        isTyping = false;
        terminalInput.disabled = false;
        terminalInput.focus();
        terminalBody.scrollTop = terminalBody.scrollHeight;
    }

    const ALL_COMMANDS = ['help','ls','locate','play snake','matrix','hack','clear','name','profession','joke','quote','hello', 'date', 'about', 'skills', 'projects', 'resume', 'experience', 'education', 'achievements', 'contact', 'ask', 'github', 'linkedin', '42', 'coffee', 'sudo', 'blog', 'read'];

    terminalInput.addEventListener('keydown', function(e) {
        if (inGame && gameType === 'snake') {
            const key = e.key.toLowerCase();
            if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d'].includes(key)) {
                e.preventDefault();
                if((key==='arrowup' || key==='w') && snakeDir.y !== 1) snakeDir={x:0,y:-1};
                if((key==='arrowdown' || key==='s') && snakeDir.y !== -1) snakeDir={x:0,y:1};
                if((key==='arrowleft' || key==='a') && snakeDir.x !== 1) snakeDir={x:-1,y:0};
                if((key==='arrowright' || key==='d') && snakeDir.x !== -1) snakeDir={x:1,y:0};
            }
        }
        
        if (e.key !== 'Enter' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown' && e.key !== 'Tab') playTerminalClack();

        if (e.key === 'Tab') {
            e.preventDefault();
            if(inGame) return;
            const val = this.value.toLowerCase();
            if (val) {
                const matches = ALL_COMMANDS.filter(c => c.startsWith(val));
                if (matches.length > 0) this.value = matches[0];
            }
        } else if (e.key === 'Enter') {
            processCommand(this.value);
        } else if (!inGame && e.key === 'ArrowUp') {
            e.preventDefault();
            if (historyIndex > 0) {
                historyIndex--;
                this.value = commandHistory[historyIndex];
            }
        } else if (!inGame && e.key === 'ArrowDown') {
            e.preventDefault();
            if (historyIndex < commandHistory.length - 1) {
                historyIndex++;
                this.value = commandHistory[historyIndex];
            } else {
                historyIndex = commandHistory.length;
                this.value = '';
            }
        }
    });

    updatePrompt();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initTerminal);
else initTerminal();
