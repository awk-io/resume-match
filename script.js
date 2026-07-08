(function() {
    'use strict';

    // DOM refs
    const jobDesc = document.getElementById('jobDesc');
    const resumeText = document.getElementById('resumeText');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const results = document.getElementById('results');
    const scoreCircle = document.getElementById('scoreCircle');
    const matchedCount = document.getElementById('matchedCount');
    const missingCount = document.getElementById('missingCount');
    const totalCount = document.getElementById('totalCount');
    const matchedSkills = document.getElementById('matchedSkills');
    const missingSkills = document.getElementById('missingSkills');
    const suggestionsList = document.getElementById('suggestionsList');
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const themeLabel = document.getElementById('themeLabel');

    // Theme (default: light)
    let currentTheme = localStorage.getItem('match-theme') || 'light';

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        currentTheme = theme;
        localStorage.setItem('match-theme', theme);
        themeIcon.className = 'fas fa-circle';
        themeLabel.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
    applyTheme(currentTheme);
    themeToggle.addEventListener('click', () => {
        applyTheme(currentTheme === 'light' ? 'dark' : 'light');
    });

    // PDF Text Extraction (pdf.js)
    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    async function extractTextFromPDF(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            const pageCount = pdf.numPages;

            for (let i = 1; i <= pageCount; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(' ');
                fullText += pageText + '\n';
            }

            if (!fullText.trim()) {
                return 'Could not extract text from this PDF. Please paste manually.';
            }
            return fullText;
        } catch (error) {
            console.warn('PDF extraction error:', error);
            return 'Could not extract text from this PDF. Please paste manually.';
        }
    }

    // File Upload
    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        fileName.textContent = file.name;

        if (file.name.toLowerCase().endsWith('.pdf')) {
            const text = await extractTextFromPDF(file);
            resumeText.value = text;
        } else {
            const reader = new FileReader();
            reader.onload = function(ev) {
                resumeText.value = ev.target.result;
            };
            reader.onerror = function() {
                resumeText.value = 'Error reading file.';
            };
            reader.readAsText(file);
        }
    });

    // Clear
    clearBtn.addEventListener('click', () => {
        jobDesc.value = '';
        resumeText.value = '';
        fileName.textContent = 'no file';
        fileInput.value = '';
        results.classList.remove('visible');
    });

    // Analyze
    function analyze() {
        const job = jobDesc.value.trim();
        const resume = resumeText.value.trim();

        if (!job || !resume) {
            results.classList.remove('visible');
            return;
        }

        analyzeBtn.disabled = true;

        // Smart keyword extraction
        function extractSkills(text) {
            const cleaned = text
                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"']/g, ' ')
                .replace(/\s+/g, ' ')
                .toLowerCase()
                .trim();

            const stopwords = new Set([
                'a', 'an', 'the', 'of', 'for', 'on', 'at', 'to', 'in', 'with',
                'without', 'and', 'or', 'but', 'from', 'by', 'as', 'is', 'was',
                'are', 'were', 'has', 'have', 'had', 'be', 'been', 'being',
                'it', 'its', 'this', 'that', 'these', 'those', 'them', 'they',
                'their', 'there', 'will', 'would', 'could', 'should', 'may',
                'might', 'must', 'can', 'etc', 'e.g', 'i.e', 'vs', 'vs.',
                'etcetera', 'including', 'such', 'like', 'etc', 'amp', 'gt',
                'lt', 'nbsp', 'plus', 'minus', 'times', 'divide', 'equals',
                'about', 'above', 'across', 'after', 'against', 'along',
                'among', 'around', 'because', 'before', 'behind', 'below',
                'beneath', 'beside', 'between', 'beyond', 'during', 'except',
                'inside', 'outside', 'over', 'under', 'upon', 'within',
                'without', 'through', 'throughout', 'toward', 'towards',
                'using', 'use', 'used', 'via', 'per', 'each', 'every', 'some',
                'any', 'no', 'none', 'very', 'too', 'much', 'more', 'most',
                'least', 'less', 'few', 'several', 'many', 'both', 'neither',
                'either', 'nor', 'so', 'than', 'that', 'then', 'thence',
                'these', 'they', 'this', 'those', 'thus', 'unto', 'when',
                'where', 'wherever', 'whether', 'which', 'while', 'whilst',
                'with', 'within', 'without', 'would'
            ]);

            const words = cleaned
                .split(/\s+/)
                .filter(w => w.length > 2 && !stopwords.has(w) && !/^[0-9]+$/.test(w) && w.length < 30);

            return [...new Set(words)];
        }

        const jobSkills = extractSkills(job);
        const resumeSkills = extractSkills(resume);

        const matched = jobSkills.filter(s => resumeSkills.includes(s));
        const missing = jobSkills.filter(s => !resumeSkills.includes(s));

        const total = jobSkills.length;
        const matchCount = matched.length;
        const score = total > 0 ? Math.round((matchCount / total) * 100) : 0;

        // Update score
        scoreCircle.textContent = score + '%';
        scoreCircle.className = 'score-circle';
        if (score >= 70) scoreCircle.classList.add('high');
        else if (score >= 40) scoreCircle.classList.add('medium');
        else scoreCircle.classList.add('low');

        matchedCount.textContent = matchCount;
        missingCount.textContent = missing.length;
        totalCount.textContent = total;

        matchedSkills.innerHTML = matched.length ?
            matched.map(s => `<span class="skill-tag match">${s}</span>`).join('') :
            '<span style="color:var(--text-muted);font-size:0.7rem;">none matched</span>';

        missingSkills.innerHTML = missing.length ?
            missing.map(s => `<span class="skill-tag missing">${s}</span>`).join('') :
            '<span style="color:var(--text-muted);font-size:0.7rem;">all skills matched! 🎉</span>';

        // Generate specific suggestions with missing keywords
        const suggestions = [];

        if (missing.length > 0) {
            const missingList = missing.slice(0, 15);
            const keywordStr = missingList.map(s => `<span class="keyword">${s}</span>`).join(', ');
            if (missing.length > 15) {
                suggestions.push(`Add these missing keywords: ${keywordStr} and ${missing.length - 15} more`);
            } else {
                suggestions.push(`Add these missing keywords: ${keywordStr}`);
            }
        }

        if (suggestions.length === 0) {
            suggestions.push('All keywords matched! Your resume is well-aligned with this job description.');
        }

        suggestionsList.innerHTML = suggestions.map(s => `<li>${s}</li>`).join('');

        results.classList.add('visible');
        analyzeBtn.disabled = false;
    }

    // Event Listeners
    analyzeBtn.addEventListener('click', analyze);

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            analyze();
        }
    });

    // Drag & Drop for Resume Textarea
    const resumeArea = document.getElementById('resumeText');
    resumeArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        resumeArea.style.borderColor = 'var(--border-focus)';
    });
    resumeArea.addEventListener('dragleave', () => {
        resumeArea.style.borderColor = 'var(--border-light)';
    });
    resumeArea.addEventListener('drop', async (e) => {
        e.preventDefault();
        resumeArea.style.borderColor = 'var(--border-light)';
        const files = e.dataTransfer.files;
        if (files.length) {
            const file = files[0];
            const name = file.name.toLowerCase();
            if (name.endsWith('.txt') || name.endsWith('.pdf')) {
                fileName.textContent = file.name;
                if (name.endsWith('.pdf')) {
                    const text = await extractTextFromPDF(file);
                    resumeArea.value = text;
                } else {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        resumeArea.value = ev.target.result;
                    };
                    reader.readAsText(file);
                }
            }
        }
    });

    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(ta => {
        ta.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 400) + 'px';
        });
    });

})();
