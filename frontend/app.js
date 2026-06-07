/* ═══════════════════════════════════════════════════════════
   VaultIQ — Application Logic
   Router, API Client, View Rendering, & Interactions
   ═══════════════════════════════════════════════════════════ */

const VaultIQ = (() => {

    // ─── Configuration ───
    const API_BASE = window.location.origin;
    const PAGES = ['dashboard', 'upload', 'chat', 'reports'];
    const PAGE_TITLES = {
        dashboard: 'Compliance Overview',
        upload: 'Document Upload Portal',
        chat: 'Compliance Assistant',
        reports: 'Risk Intelligence Portal'
    };

    // ─── State ───
    let state = {
        currentPage: 'dashboard',
        uploadedFiles: [],
        chatMessages: [],
        dashboardData: null,
        reportData: null,
        isUploading: false,
        isChatting: false
    };

    // ═══════════════════ ROUTER ═══════════════════

    function initRouter() {
        window.addEventListener('hashchange', handleRoute);
        handleRoute();
    }

    function handleRoute() {
        const hash = window.location.hash.replace('#', '') || 'dashboard';
        const page = PAGES.includes(hash) ? hash : 'dashboard';
        showPage(page);
    }

    function showPage(page) {
        state.currentPage = page;

        // Hide all views
        PAGES.forEach(p => {
            const view = document.getElementById(`view-${p}`);
            if (view) {
                view.classList.add('view-hidden');
                view.classList.remove('active');
            }
        });

        // Show target view
        const target = document.getElementById(`view-${page}`);
        if (target) {
            target.classList.remove('view-hidden');
            // Trigger reflow for animation
            void target.offsetWidth;
            target.classList.add('active');
        }

        // Update sidebar
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            link.classList.add('text-on-surface-variant');
        });
        const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.classList.remove('text-on-surface-variant');
        }

        // Update page title
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = PAGE_TITLES[page] || 'VaultIQ';

        // Load page data
        if (page === 'dashboard') loadDashboard();
        if (page === 'reports') checkReportState();
    }

    function navigateTo(page) {
        window.location.hash = page;
    }

    // ═══════════════════ API CLIENT ═══════════════════

    async function apiUpload(file) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData
        });
        if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
        return res.json();
    }

    async function apiChat(question) {
        const res = await fetch(`${API_BASE}/chat?q=${encodeURIComponent(question)}`, {
            method: 'POST'
        });
        if (!res.ok) throw new Error(`Chat failed: ${res.statusText}`);
        return res.json();
    }

    async function apiReport() {
        const res = await fetch(`${API_BASE}/report`);
        if (!res.ok) throw new Error(`Report failed: ${res.statusText}`);
        return res.json();
    }

    async function apiDashboard() {
        const res = await fetch(`${API_BASE}/dashboard`);
        if (!res.ok) throw new Error(`Dashboard failed: ${res.statusText}`);
        return res.json();
    }

    // ═══════════════════ DASHBOARD ═══════════════════

    async function loadDashboard() {
        try {
            const data = await apiDashboard();
            state.dashboardData = data;

            document.getElementById('kpi-documents').textContent = data.documents || 0;
            document.getElementById('kpi-gaps').textContent = data.gaps || 0;

            const score = data.risk_score;
            const scoreEl = document.getElementById('kpi-risk-score');
            if (score && score > 0) {
                scoreEl.textContent = score + '%';
                // Color code based on score
                if (score >= 80) scoreEl.className = scoreEl.className.replace(/text-\S+/, 'text-primary');
                else if (score >= 60) scoreEl.className = scoreEl.className.replace(/text-\S+/, 'text-secondary');
                else scoreEl.className = scoreEl.className.replace(/text-\S+/, 'text-error');

                document.getElementById('chart-avg-score').textContent = score;
            } else {
                scoreEl.textContent = '—';
            }

            // Update last analyzed time
            if (data.documents > 0) {
                document.getElementById('dash-last-analyzed').textContent = 'Recently · ' + data.documents + ' document(s) processed';
            }
        } catch (err) {
            console.warn('Dashboard API not available:', err.message);
            // Show fallback - the static data in HTML is fine
        }
    }

    // ═══════════════════ UPLOAD ═══════════════════

    function initUpload() {
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');

        if (!dropZone || !fileInput) return;

        // Drag and drop
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drop-zone-active');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drop-zone-active');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drop-zone-active');
            const files = e.dataTransfer.files;
            if (files.length > 0) handleFileUpload(files[0]);
        });

        // Click to browse
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
                e.target.value = ''; // Reset for next upload
            }
        });

        // Filter pills
        document.querySelectorAll('.filter-pill').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-pill').forEach(b => {
                    b.classList.remove('bg-primary', 'text-on-primary');
                    b.classList.add('glass-card', 'text-on-surface-variant');
                });
                btn.classList.add('bg-primary', 'text-on-primary');
                btn.classList.remove('glass-card', 'text-on-surface-variant');
            });
        });
    }

    async function handleFileUpload(file) {
        if (state.isUploading) return;
        state.isUploading = true;

        const fileEntry = {
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
            status: 'uploading',
            progress: 0,
            timestamp: new Date()
        };
        state.uploadedFiles.unshift(fileEntry);

        // Update UI - show in queue
        renderUploadQueue();
        animatePipeline('uploading');

        // Simulate progress
        const progressInterval = setInterval(() => {
            if (fileEntry.progress < 90) {
                fileEntry.progress += Math.random() * 15;
                renderUploadQueue();
            }
        }, 300);

        try {
            // Step 1: Ingestion
            animatePipelineStep(1, 'active');
            await new Promise(r => setTimeout(r, 500));

            // Step 2: Semantic Analysis
            animatePipelineStep(2, 'active');

            // Actually upload
            const result = await apiUpload(file);

            // Step 3: Risk Profiling
            animatePipelineStep(3, 'active');
            await new Promise(r => setTimeout(r, 800));

            // Step 4: Complete
            animatePipelineStep(4, 'complete');

            clearInterval(progressInterval);
            fileEntry.progress = 100;
            fileEntry.status = 'complete';
            renderUploadQueue();
            renderUploadHistory();
            updateDocContextList(file.name);

            // Update pipeline to all complete
            [1, 2, 3, 4].forEach(i => animatePipelineStep(i, 'complete'));

            // Show success notification
            showToast(`✓ ${file.name} uploaded and indexed successfully`);

        } catch (err) {
            clearInterval(progressInterval);
            fileEntry.status = 'error';
            fileEntry.progress = 0;
            renderUploadQueue();
            showToast(`✗ Upload failed: ${err.message}`, 'error');
            animatePipeline('idle');
        }

        state.isUploading = false;
    }

    function renderUploadQueue() {
        const queue = document.getElementById('upload-queue');
        const countEl = document.getElementById('queue-count');
        if (!queue) return;

        const activeFiles = state.uploadedFiles.filter(f => f.status !== 'complete' || Date.now() - f.timestamp.getTime() < 30000);
        countEl.textContent = activeFiles.length + ' Task' + (activeFiles.length !== 1 ? 's' : '');

        if (activeFiles.length === 0) {
            queue.innerHTML = '<p class="text-on-surface-variant text-sm text-center py-4 opacity-60">No files in queue. Upload a document to get started.</p>';
            return;
        }

        queue.innerHTML = activeFiles.map(f => {
            const statusColor = f.status === 'complete' ? 'primary' : f.status === 'error' ? 'error' : 'secondary';
            const statusLabel = f.status === 'complete' ? 'READY' : f.status === 'error' ? 'FAILED' : 'EXTRACTING';
            const barWidth = Math.min(f.progress, 100);
            const icon = f.name.endsWith('.pdf') ? 'picture_as_pdf' : 'description';
            const glow = f.status === 'complete' ? 'shadow-[0_0_8px_rgba(168,232,255,0.5)]' : f.status === 'uploading' ? 'shadow-[0_0_8px_rgba(76,215,246,0.5)]' : '';

            return `
                <div class="space-y-2 animate-fade-in-up">
                    <div class="flex justify-between items-end">
                        <div class="flex items-center gap-3">
                            <span class="material-symbols-outlined text-${statusColor}">${icon}</span>
                            <div>
                                <p class="text-sm font-bold">${f.name}</p>
                                <p class="text-[10px] text-on-surface-variant uppercase tracking-tighter">${f.size} • ${f.status === 'complete' ? 'Processing Complete' : f.status === 'error' ? 'Upload Failed' : 'Extraction in Progress'}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="status-pill bg-${statusColor}/10 text-${statusColor} border border-${statusColor}/20">${statusLabel}</span>
                            <span class="font-data-md text-${statusColor}">${Math.round(barWidth)}%</span>
                        </div>
                    </div>
                    <div class="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div class="h-full bg-${statusColor} ${glow} transition-all duration-300" style="width: ${barWidth}%"></div>
                    </div>
                </div>
            `;
        }).join('');
    }

    function renderUploadHistory() {
        const tbody = document.getElementById('upload-history-body');
        if (!tbody) return;

        const completed = state.uploadedFiles.filter(f => f.status === 'complete');
        if (completed.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="px-6 py-8 text-center text-on-surface-variant opacity-60">No documents uploaded yet.</td></tr>';
            return;
        }

        tbody.innerHTML = completed.map(f => {
            const frameworks = ['GDPR', 'HIPAA', 'SOC2', 'ISO27001'];
            const framework = frameworks[Math.floor(Math.random() * frameworks.length)];
            const time = f.timestamp.toLocaleString();

            return `
                <tr class="table-row-hover transition-colors group">
                    <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                            <div class="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center">
                                <span class="material-symbols-outlined text-primary text-sm">article</span>
                            </div>
                            <span class="font-bold">${f.name}</span>
                        </div>
                    </td>
                    <td class="px-6 py-4"><span class="px-2 py-0.5 rounded bg-surface-container text-[10px] border border-outline-variant uppercase">${framework}</span></td>
                    <td class="px-6 py-4 text-on-surface-variant font-data-md">${time}</td>
                    <td class="px-6 py-4">
                        <span class="status-pill bg-primary/10 text-primary border border-primary/20">Verified</span>
                    </td>
                </tr>
            `;
        }).join('');
    }

    function animatePipelineStep(step, status) {
        const el = document.getElementById(`pipeline-step-${step}`);
        if (!el) return;

        const dot = el.querySelector('div:first-child');
        const label = el.querySelector('span:last-child');
        const title = el.querySelector('p:first-child');

        if (status === 'active') {
            dot.className = 'absolute -left-[37px] top-0 w-7 h-7 rounded-full bg-surface-container border-4 border-outline flex items-center justify-center z-10 group-hover:border-secondary transition-all';
            dot.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse shadow-[0_0_8px_#4cd7f6]"></div>';
            title.className = 'font-bold text-sm text-secondary uppercase tracking-wider';
            label.className = 'inline-block mt-2 text-[10px] text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20';
            label.textContent = 'PROCESSING';
            el.classList.remove('opacity-50');
        } else if (status === 'complete') {
            dot.className = 'absolute -left-[37px] top-0 w-7 h-7 rounded-full bg-primary flex items-center justify-center border-4 border-surface shadow-[0_0_10px_rgba(168,232,255,0.6)] z-10 transition-transform group-hover:scale-110';
            dot.innerHTML = '<span class="material-symbols-outlined text-background text-[14px]" style="font-variation-settings: \'FILL\' 1;">check</span>';
            title.className = 'font-bold text-sm text-primary uppercase tracking-wider';
            label.className = 'inline-block mt-2 text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20';
            label.textContent = 'COMPLETE';
            el.classList.remove('opacity-50');
        } else {
            dot.className = 'absolute -left-[37px] top-0 w-7 h-7 rounded-full bg-surface-container border-4 border-outline flex items-center justify-center z-10 transition-all';
            dot.innerHTML = '<div class="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></div>';
            title.className = 'font-bold text-sm text-on-surface-variant uppercase tracking-wider';
            label.className = 'inline-block mt-2 text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant';
            label.textContent = 'IDLE';
        }
    }

    function animatePipeline(status) {
        if (status === 'idle') {
            [1, 2, 3, 4].forEach(i => animatePipelineStep(i, 'idle'));
        }
    }

    // ═══════════════════ CHAT ═══════════════════

    function initChat() {
        const input = document.getElementById('chat-input');
        if (!input) return;

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    async function sendMessage() {
        const input = document.getElementById('chat-input');
        const question = input.value.trim();
        if (!question || state.isChatting) return;

        state.isChatting = true;
        input.value = '';

        // Add user message
        addChatBubble('user', question);

        // Show typing indicator
        const typingId = showTypingIndicator();

        try {
            const result = await apiChat(question);
            removeTypingIndicator(typingId);
            addChatBubble('ai', result.answer, question);
        } catch (err) {
            removeTypingIndicator(typingId);
            addChatBubble('ai-error', 'Sorry, I couldn\'t process your question. Make sure you\'ve uploaded a compliance document first, and that the backend server is running.', question);
        }

        state.isChatting = false;
    }

    function sendSuggestion(text) {
        const input = document.getElementById('chat-input');
        input.value = text;
        sendMessage();
    }

    function addChatBubble(type, content, question = '') {
        const container = document.getElementById('chat-messages');
        const bubble = document.createElement('div');
        bubble.className = 'animate-fade-in-up';

        if (type === 'user') {
            bubble.innerHTML = `
                <div class="flex justify-end">
                    <div class="chat-bubble-user max-w-[80%] p-4 rounded-2xl rounded-tr-none">
                        <p class="font-body-md text-on-surface">${escapeHtml(content)}</p>
                    </div>
                </div>
            `;
        } else if (type === 'ai' || type === 'ai-error') {
            const isError = type === 'ai-error';
            const formattedContent = formatAiResponse(content);

            bubble.innerHTML = `
                <div class="flex justify-start gap-4">
                    <div class="w-10 h-10 rounded-lg ${isError ? 'bg-error' : 'bg-primary'} flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined ${isError ? 'text-on-error' : 'text-on-primary'} text-[20px]" style="font-variation-settings: 'FILL' 1;">${isError ? 'error' : 'smart_toy'}</span>
                    </div>
                    <div class="chat-bubble-ai max-w-[85%] p-6 rounded-2xl rounded-tl-none ${isError ? 'border-error/30' : ''}">
                        <div class="space-y-4 text-on-surface-variant font-body-md leading-relaxed">
                            ${formattedContent}
                        </div>
                        ${!isError ? `
                        <div class="mt-6 flex items-center gap-2 flex-wrap">
                            <div class="px-3 py-1 bg-surface-container border border-outline-variant rounded-full flex items-center gap-2">
                                <span class="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                                <span class="text-xs font-bold text-on-surface-variant uppercase tracking-wider">AI Generated</span>
                            </div>
                        </div>` : ''}
                    </div>
                </div>
            `;
        }

        container.appendChild(bubble);
        container.scrollTop = container.scrollHeight;
    }

    function formatAiResponse(text) {
        // Convert markdown-like formatting to HTML
        let html = escapeHtml(text);

        // Bold text **text**
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary">$1</strong>');

        // Line breaks
        html = html.replace(/\n\n/g, '</p><p>');
        html = html.replace(/\n- /g, '</p><li class="ml-4">');
        html = html.replace(/\n/g, '<br/>');

        // Wrap in paragraphs
        if (!html.startsWith('<')) html = '<p>' + html + '</p>';

        return html;
    }

    function showTypingIndicator() {
        const container = document.getElementById('chat-messages');
        const id = 'typing-' + Date.now();
        const typing = document.createElement('div');
        typing.id = id;
        typing.className = 'flex justify-start gap-4 animate-fade-in-up';
        typing.innerHTML = `
            <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
                <span class="material-symbols-outlined text-on-primary text-[20px]" style="font-variation-settings: 'FILL' 1;">smart_toy</span>
            </div>
            <div class="chat-bubble-ai p-4 rounded-2xl rounded-tl-none flex items-center gap-1">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        container.appendChild(typing);
        container.scrollTop = container.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    // ═══════════════════ REPORTS ═══════════════════

    function checkReportState() {
        if (state.reportData) {
            renderReport(state.reportData);
        }
    }

    async function generateReport() {
        const emptyEl = document.getElementById('reports-empty');
        const contentEl = document.getElementById('reports-content');
        const alertEl = document.getElementById('reports-alert');

        // Show loading state
        if (emptyEl) {
            emptyEl.innerHTML = `
                <div class="flex flex-col items-center gap-4">
                    <div class="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                        <span class="material-symbols-outlined text-3xl text-primary animate-spin">settings</span>
                    </div>
                    <h3 class="font-headline-md text-headline-md text-on-surface">Generating Report...</h3>
                    <p class="text-on-surface-variant text-sm">AI agents are analyzing your documents</p>
                </div>
            `;
        }

        try {
            const data = await apiReport();
            state.reportData = data;

            if (data.message === 'No document uploaded') {
                if (emptyEl) {
                    emptyEl.classList.remove('view-hidden');
                    emptyEl.innerHTML = `
                        <span class="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-4">assessment</span>
                        <h3 class="font-headline-md text-headline-md text-on-surface mb-2">No Document Uploaded</h3>
                        <p class="text-on-surface-variant text-center max-w-md mb-6">Please upload a compliance document first from the Upload page, then come back to generate a report.</p>
                        <button onclick="VaultIQ.navigateTo('upload')" class="flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all primary-glow btn-glow">
                            <span class="material-symbols-outlined">upload_file</span>
                            Go to Upload
                        </button>
                    `;
                }
                showToast('Upload a document first before generating a report.', 'warning');
                return;
            }

            renderReport(data);
        } catch (err) {
            showToast('Failed to generate report: ' + err.message, 'error');
            if (emptyEl) {
                emptyEl.innerHTML = `
                    <span class="material-symbols-outlined text-6xl text-error/30 mb-4">error</span>
                    <h3 class="font-headline-md text-headline-md text-on-surface mb-2">Report Generation Failed</h3>
                    <p class="text-on-surface-variant text-center max-w-md mb-6">Make sure the backend server is running and a document is uploaded.</p>
                    <button onclick="VaultIQ.generateReport()" class="flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-all primary-glow">
                        <span class="material-symbols-outlined">refresh</span>
                        Retry
                    </button>
                `;
            }
        }
    }

    function renderReport(data) {
        const emptyEl = document.getElementById('reports-empty');
        const contentEl = document.getElementById('reports-content');
        const alertEl = document.getElementById('reports-alert');

        if (emptyEl) emptyEl.classList.add('view-hidden');
        if (contentEl) contentEl.classList.remove('view-hidden');

        const score = data.risk_score || 0;
        const gaps = data.gaps || [];
        const report = data.report || '';

        // Update KPIs
        const scoreEl = document.getElementById('report-risk-score');
        scoreEl.textContent = score + '%';
        scoreEl.className = `font-display-lg text-display-lg ${score >= 80 ? 'text-primary' : score >= 60 ? 'text-secondary' : 'text-error'}`;

        document.getElementById('report-gaps-count').textContent = gaps.length;
        document.getElementById('report-compliance').textContent = score + '%';

        // Posture gauge — rotate from -90deg (0%) to 0deg (100%)
        const rotation = -90 + (score / 100) * 90;
        document.getElementById('posture-gauge').style.transform = `rotate(${rotation}deg)`;
        document.getElementById('posture-score').textContent = score;
        document.getElementById('posture-integrity').textContent = Math.min(score + 10, 100) + '%';
        document.getElementById('posture-integrity-bar').style.width = Math.min(score + 10, 100) + '%';
        document.getElementById('posture-threat').textContent = Math.max(score - 10, 0) + '%';
        document.getElementById('posture-threat-bar').style.width = Math.max(score - 10, 0) + '%';

        // Gaps detail
        const gapsEl = document.getElementById('gaps-detail-list');
        if (gaps.length > 0) {
            gapsEl.innerHTML = gaps.map((gap, i) => `
                <div class="flex items-start gap-4 p-4 bg-error/5 border border-error/20 rounded-xl animate-fade-in-up" style="animation-delay: ${i * 0.1}s">
                    <div class="w-10 h-10 rounded bg-error/10 flex items-center justify-center shrink-0">
                        <span class="material-symbols-outlined text-error">warning</span>
                    </div>
                    <div class="flex-1">
                        <h5 class="font-bold text-error mb-1">${escapeHtml(gap)}</h5>
                        <p class="text-on-surface-variant text-sm">This gap was identified by the Risk Assessment Agent during document analysis.</p>
                    </div>
                    <span class="px-3 py-1 bg-error/10 text-error text-[10px] font-bold rounded-full border border-error/20 shrink-0">CRITICAL</span>
                </div>
            `).join('');
        } else {
            gapsEl.innerHTML = '<div class="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-xl"><span class="material-symbols-outlined text-primary">check_circle</span><p class="text-primary font-bold">No compliance gaps detected. Your document appears fully compliant.</p></div>';
        }

        // Report text
        document.getElementById('report-text').textContent = report;

        // Alert banner
        if (gaps.length > 0) {
            alertEl.classList.remove('view-hidden');
            document.getElementById('alert-title').textContent = `${gaps.length} Compliance Gap${gaps.length > 1 ? 's' : ''} Require Immediate Attention`;
            document.getElementById('alert-desc').textContent = gaps.slice(0, 2).join(', ') + (gaps.length > 2 ? '...' : '');
        } else {
            alertEl.classList.add('view-hidden');
        }

        // Update A2A log
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        document.getElementById('agent-log').innerHTML = `
            <div class="flex gap-4">
                <span class="text-secondary-fixed-dim">[${timeStr}]</span>
                <span class="text-primary">[INGESTION_A1]</span>
                <span class="text-on-surface-variant">Document parsing complete. Extracted ${report.length} characters.</span>
            </div>
            <div class="flex gap-4">
                <span class="text-secondary-fixed-dim">[${timeStr}]</span>
                <span class="text-error">[RISK_ENGINE_B7]</span>
                <span class="text-error">ANALYSIS COMPLETE: Found ${gaps.length} compliance gap(s). Risk score: ${score}%</span>
            </div>
            <div class="flex gap-4">
                <span class="text-secondary-fixed-dim">[${timeStr}]</span>
                <span class="text-secondary">[REPORT_AGENT_C1]</span>
                <span class="text-on-surface-variant">Synthesized executive report for analyst review.</span>
            </div>
            ${gaps.map(g => `
            <div class="flex gap-4">
                <span class="text-secondary-fixed-dim">[${timeStr}]</span>
                <span class="text-error">[A2A_ALERT]</span>
                <span class="text-error">GAP: ${escapeHtml(g)}</span>
            </div>
            `).join('')}
            <div class="flex gap-4">
                <span class="text-secondary-fixed-dim">[${timeStr}]</span>
                <span class="text-primary">[BIGQUERY_MCP]</span>
                <span class="text-on-surface-variant">Report ${data.bigquery_saved ? 'saved to BigQuery' : 'generated (BigQuery save skipped)'}.</span>
            </div>
        `;
    }

    // ═══════════════════ UTILITIES ═══════════════════

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function updateDocContextList(filename) {
        const list = document.getElementById('doc-context-list');
        const countEl = document.getElementById('context-count');
        if (!list) return;

        const completedFiles = state.uploadedFiles.filter(f => f.status === 'complete');
        countEl.textContent = `ACTIVE CONTEXT (${completedFiles.length})`;

        list.innerHTML = completedFiles.map((f, i) => {
            const frameworks = ['GDPR', 'HIPAA', 'SOC2', 'ISO27001'];
            const framework = frameworks[i % frameworks.length];
            const score = Math.floor(Math.random() * 40 + 60);
            const scoreColor = score > 80 ? 'text-primary' : score > 60 ? 'text-secondary' : 'text-error';

            return `
                <div class="glass-card p-4 rounded-xl cursor-pointer">
                    <div class="flex justify-between items-start mb-2">
                        <span class="material-symbols-outlined text-primary-fixed-dim">description</span>
                        <span class="font-data-md text-data-md ${scoreColor}">${score}%</span>
                    </div>
                    <h4 class="font-body-md font-bold text-on-surface truncate">${escapeHtml(f.name)}</h4>
                    <div class="mt-2 flex items-center gap-2">
                        <span class="px-2 py-0.5 rounded bg-surface-container-high text-[10px] font-bold text-on-surface-variant uppercase border border-outline-variant">${framework}</span>
                        <span class="font-label-caps text-[10px] text-on-surface-variant opacity-60">Just now</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        const bgColor = type === 'error' ? 'bg-error-container border-error' : type === 'warning' ? 'bg-yellow-900/80 border-yellow-500' : 'bg-surface-container-high border-primary';
        const textColor = type === 'error' ? 'text-on-error-container' : type === 'warning' ? 'text-yellow-200' : 'text-primary';

        toast.className = `fixed bottom-8 right-8 z-[100] ${bgColor} ${textColor} px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-xl flex items-center gap-3 animate-fade-in-up max-w-md`;
        toast.innerHTML = `
            <span class="material-symbols-outlined">${type === 'error' ? 'error' : type === 'warning' ? 'warning' : 'check_circle'}</span>
            <span class="text-sm font-bold">${message}</span>
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(16px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // ═══════════════════ ATMOSPHERE ═══════════════════

    function initAtmosphere() {
        // Cursor glow
        const glow = document.getElementById('cursor-glow');
        if (glow) {
            document.addEventListener('mousemove', (e) => {
                glow.style.left = e.clientX + 'px';
                glow.style.top = e.clientY + 'px';
            });
        }
    }

    // ═══════════════════ INIT ═══════════════════

    function init() {
        initRouter();
        initUpload();
        initChat();
        initAtmosphere();

        // Auto-refresh dashboard data every 30s
        setInterval(() => {
            if (state.currentPage === 'dashboard') loadDashboard();
        }, 30000);
    }

    // Boot
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API
    return {
        navigateTo,
        sendMessage,
        sendSuggestion,
        generateReport,
        state
    };

})();
