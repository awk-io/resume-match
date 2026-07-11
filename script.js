/* app.js */
(function() {
    const jobInput = document.getElementById('jobInput');
    const resumeInput = document.getElementById('resumeInput');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const resultsContainer = document.getElementById('resultsContainer');
    const scoreCircle = document.getElementById('scoreCircle');
    const matchedCount = document.getElementById('matchedCount');
    const missingCount = document.getElementById('missingCount');
    const totalCount = document.getElementById('totalCount');
    const matchedList = document.getElementById('matchedList');
    const missingList = document.getElementById('missingList');
    const suggestList = document.getElementById('suggestList');
    const jobWordCount = document.getElementById('jobWordCount');
    const resumeWordCount = document.getElementById('resumeWordCount');

    function extractKeywords(text) {
        const cleaned = text
            .toLowerCase()
            .replace(/[^a-zA-Z0-9\s#+.]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (!cleaned) return [];

        const stopwords = new Set([
            'a','an','the','of','for','on','at','to','in','with','without',
            'and','or','but','from','by','as','is','was','are','were','has',
            'have','had','be','been','being','it','its','this','that','these',
            'those','them','they','their','there','will','would','could',
            'should','may','might','must','can','etc','eg','ie','vs','including',
            'such','like','amp','plus','minus','times','divide','equals',
            'about','above','across','after','against','along','among',
            'around','because','before','behind','below','beneath','beside',
            'between','beyond','during','except','inside','outside','over',
            'under','upon','within','through','throughout','toward','towards',
            'using','use','used','via','per','each','every','some','any',
            'no','none','very','too','much','more','most','least','less',
            'few','several','many','both','neither','either','nor','so',
            'than','then','thence','thus','unto','when','where','wherever',
            'whether','which','while','whilst','also','well','get','make',
            'take','see','know','need','want','work','year','month','day',
            'time','including','across','against','among','around','because',
            'before','behind','below','beneath','beside','between','beyond',
            'during','except','inside','outside','over','under','upon',
            'through','toward','towards','via','per','each','every','some',
            'any','no','none','very','too','much','more','most','least',
            'less','few','several','many','both','neither','either','nor',
            'so','than','then','thence','these','they','this','those','thus',
            'unto','when','where','wherever','whether','which','while',
            'whilst','with','within','without','would','able','according',
            'accordingly','actually','adjusted','all','almost','already',
            'also','although','always','among','amongst','amount','anyhow',
            'anything','anyway','anywhere','around','became','become',
            'becomes','becoming','before','behind','being','below','beside',
            'besides','between','beyond','both','cannot','certain','certainly',
            'clear','clearly','come','could','did','different','does','done',
            'down','during','each','either','enough','especially','even',
            'ever','every','everyone','everything','everywhere','except',
            'fairly','few','for','former','formerly','from','further',
            'furthermore','get','give','given','go','gone','got','great',
            'greatly','had','has','hasnt','having','he','hence','her','here',
            'hereafter','hereby','herein','hereupon','hers','herself','him',
            'himself','his','how','however','hundred','i','if','in','indeed',
            'instead','into','is','it','its','itself','just','keep','kept',
            'know','known','least','less','let','like','likely','make','many',
            'may','me','meanwhile','might','more','moreover','most','mostly',
            'much','must','my','myself','name','namely','neither','never',
            'nevertheless','next','no','nobody','none','noone','nor','not',
            'nothing','now','nowhere','of','off','often','on','only','onto',
            'or','other','others','otherwise','our','ours','ourselves','out',
            'over','own','part','particular','particularly','per','perhaps',
            'please','possible','presumably','probably','rather','really',
            'regarding','right','same','seem','seemed','seeming','seems',
            'serious','several','she','should','since','so','some','somehow',
            'someone','something','sometime','sometimes','somewhat','somewhere',
            'still','such','than','that','the','their','them','themselves',
            'then','thence','there','thereafter','thereby','therefore',
            'therein','thereupon','these','they','this','those','though',
            'through','throughout','thru','thus','to','together','too',
            'toward','towards','under','unless','until','up','upon','us',
            'very','was','we','well','were','what','whatever','when','whence',
            'whenever','where','whereafter','whereas','whereby','wherein',
            'whereupon','wherever','whether','which','while','whither','who',
            'whoever','whole','whom','whose','why','will','with','within',
            'without','would','yet','you','your','yours','yourself','yourselves',
            'experience','especially','required','preferred','nice','good',
            'great','excellent','strong','solid','proven','track','record',
            'history','looking','seeking','hiring','role','position','team',
            'company','client','project','manage','management','lead','leading',
            'led','responsible','responsibilities','duties','tasks','activities',
            'support','provide','ensure','maintain','develop','developing',
            'implement','implementing','design','designing','build','building',
            'create','creating','plan','planning','coordinate','coordinating',
            'analyze','analyzing','evaluate','evaluating','improve','improving',
            'increase','decrease','reduce','growth','grow','exceed','achieve'
        ]);

        const words = cleaned.split(/\s+/).filter(w => w.length >= 2 && !/^[0-9]+$/.test(w) && w.length < 40);
        const filtered = words.filter(w => !stopwords.has(w) && !stopwords.has(w.replace(/[^a-zA-Z]/g, '')));

        const result = [];
        const seen = new Set();
        for (let w of filtered) {
            const stem = w.replace(/(ing|ed|ly|tion|s|es|ment|ness|ity|ful|ous|al|ic|ary|ery|ance|ence|ism|ize|ise|able|ible|ive|ent|ant)$/, '');
            const key = stem.length >= 2 ? stem : w;
            if (!seen.has(key)) {
                seen.add(key);
                result.push(key);
            }
        }
        return result.sort();
    }

    function updateWordCounts() {
        jobWordCount.textContent = jobInput.value.trim() ? jobInput.value.trim().split(/\s+/).length + ' words' : '0 words';
        resumeWordCount.textContent = resumeInput.value.trim() ? resumeInput.value.trim().split(/\s+/).length + ' words' : '0 words';
    }

    jobInput.addEventListener('input', updateWordCounts);
    resumeInput.addEventListener('input', updateWordCounts);
    updateWordCounts();

    const pdfjsLib = window.pdfjsLib;
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    fileInput.addEventListener('change', async function(e) {
        const file = e.target.files[0];
        if (!file) return;
        fileName.textContent = file.name;
        const ext = file.name.toLowerCase().split('.').pop();
        if (ext === 'pdf') {
            try {
                const buf = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ') + '\n';
                }
                resumeInput.value = text.trim() || 'pdf extraction failed';
            } catch {
                resumeInput.value = 'pdf extraction failed';
            }
        } else {
            const reader = new FileReader();
            reader.onload = (ev) => { resumeInput.value = ev.target.result; updateWordCounts(); };
            reader.readAsText(file);
        }
        updateWordCounts();
    });

    resumeInput.addEventListener('dragover', e => { e.preventDefault(); resumeInput.style.borderColor = '#a0a096'; });
    resumeInput.addEventListener('dragleave', () => { resumeInput.style.borderColor = ''; });
    resumeInput.addEventListener('drop', async e => {
        e.preventDefault();
        resumeInput.style.borderColor = '';
        const file = e.dataTransfer.files[0];
        if (!file) return;
        fileName.textContent = file.name;
        const ext = file.name.toLowerCase().split('.').pop();
        if (ext === 'pdf') {
            try {
                const buf = await file.arrayBuffer();
                const pdf = await pdfjsLib.getDocument({ data: buf }).promise;
                let text = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const content = await page.getTextContent();
                    text += content.items.map(item => item.str).join(' ') + '\n';
                }
                resumeInput.value = text.trim() || 'pdf extraction failed';
            } catch {
                resumeInput.value = 'pdf extraction failed';
            }
        } else {
            const reader = new FileReader();
            reader.onload = (ev) => { resumeInput.value = ev.target.result; updateWordCounts(); };
            reader.readAsText(file);
        }
        updateWordCounts();
    });

    function analyze() {
        const job = jobInput.value.trim();
        const resume = resumeInput.value.trim();
        if (!job || !resume) {
            resultsContainer.classList.remove('visible');
            return;
        }

        const jobKeywords = extractKeywords(job);
        const resumeKeywords = extractKeywords(resume);

        const matched = jobKeywords.filter(k => resumeKeywords.includes(k));
        const missing = jobKeywords.filter(k => !resumeKeywords.includes(k));

        const total = jobKeywords.length;
        const matchCount = matched.length;
        const missCount = missing.length;
        const score = total > 0 ? Math.round((matchCount / total) * 100) : 0;

        scoreCircle.textContent = score + '%';
        scoreCircle.className = 'score-circle';
        if (score >= 70) scoreCircle.classList.add('high');
        else if (score >= 40) scoreCircle.classList.add('medium');
        else scoreCircle.classList.add('low');

        matchedCount.textContent = matchCount;
        missingCount.textContent = missCount;
        totalCount.textContent = total;

        matchedList.innerHTML = '';
        if (matched.length) {
            matched.forEach(k => {
                const li = document.createElement('li');
                li.className = 'match';
                li.textContent = k;
                matchedList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'none matched';
            matchedList.appendChild(li);
        }

        missingList.innerHTML = '';
        if (missing.length) {
            missing.forEach(k => {
                const li = document.createElement('li');
                li.className = 'miss';
                li.textContent = k;
                missingList.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'all keywords matched';
            missingList.appendChild(li);
        }

        suggestList.innerHTML = '';
        if (missing.length > 0) {
            const top = missing.slice(0, 10);
            top.forEach(k => {
                const li = document.createElement('li');
                li.textContent = k;
                suggestList.appendChild(li);
            });
            if (missing.length > 10) {
                const li = document.createElement('li');
                li.textContent = '+' + (missing.length - 10) + ' more';
                li.style.background = 'transparent';
                li.style.border = 'none';
                li.style.color = '#8a8a82';
                suggestList.appendChild(li);
            }
        } else {
            const li = document.createElement('li');
            li.className = 'empty';
            li.textContent = 'no missing keywords';
            suggestList.appendChild(li);
        }

        resultsContainer.classList.add('visible');
    }

    analyzeBtn.addEventListener('click', analyze);

    clearBtn.addEventListener('click', () => {
        jobInput.value = '';
        resumeInput.value = '';
        fileInput.value = '';
        fileName.textContent = 'no file';
        resultsContainer.classList.remove('visible');
        updateWordCounts();
    });

    let debounce = null;
    function autoAnalyze() {
        if (resultsContainer.classList.contains('visible')) {
            clearTimeout(debounce);
            debounce = setTimeout(analyze, 500);
        }
    }
    jobInput.addEventListener('input', autoAnalyze);
    resumeInput.addEventListener('input', autoAnalyze);

    jobInput.value = '';
    resumeInput.value = '';
    updateWordCounts();
    resultsContainer.classList.remove('visible');
})();
