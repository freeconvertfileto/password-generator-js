(function() {
    var lengthEl    = document.getElementById('passLength');
    var lengthValEl = document.getElementById('passLengthVal');
    var countEl     = document.getElementById('passCount');
    var upperEl     = document.getElementById('passUpper');
    var lowerEl     = document.getElementById('passLower');
    var numbersEl   = document.getElementById('passNumbers');
    var symbolsEl   = document.getElementById('passSymbols');
    var generateBtn = document.getElementById('passGenerate');
    var outputEl    = document.getElementById('passOutput');

    var UPPER   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var LOWER   = 'abcdefghijklmnopqrstuvwxyz';
    var NUMBERS = '0123456789';
    var SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    // Translatable labels from data attributes
    var labelCopy   = (generateBtn && generateBtn.dataset.copy)   || 'Copy';
    var labelCopied = (generateBtn && generateBtn.dataset.copied) || 'Copied!';
    var labelWeak   = (generateBtn && generateBtn.dataset.weak)   || 'Weak';
    var labelFair   = (generateBtn && generateBtn.dataset.fair)   || 'Fair';
    var labelGood   = (generateBtn && generateBtn.dataset.good)   || 'Good';
    var labelStrong = (generateBtn && generateBtn.dataset.strong) || 'Strong';

    // Sync .is-checked visual state from checkbox state
    function syncCheck(checkbox) {
        var label = checkbox.closest ? checkbox.closest('.passgen-check') : checkbox.parentElement;
        if (!label) return;
        if (checkbox.checked) {
            label.classList.add('is-checked');
        } else {
            label.classList.remove('is-checked');
        }
    }

    // Init checked visuals
    [upperEl, lowerEl, numbersEl, symbolsEl].forEach(function(cb) {
        if (!cb) return;
        syncCheck(cb);
        cb.addEventListener('change', function() {
            syncCheck(cb);
            generate();
        });
    });

    // Slider — update label + regenerate
    if (lengthEl && lengthValEl) {
        lengthEl.addEventListener('input', function() {
            lengthValEl.textContent = lengthEl.value;
            generate();
        });
    }

    // Count — regenerate on change
    if (countEl) {
        countEl.addEventListener('input', generate);
        countEl.addEventListener('change', generate);
    }

    function getStrength(password) {
        var score = 0;
        if (password.length >= 12) score++;
        if (password.length >= 16) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;
        if (score <= 2) return { label: labelWeak,   cls: 'weak' };
        if (score <= 3) return { label: labelFair,   cls: 'fair' };
        if (score <= 4) return { label: labelGood,   cls: 'good' };
        return             { label: labelStrong, cls: 'strong' };
    }

    function generatePassword(length, charset) {
        var arr = new Uint32Array(length);
        crypto.getRandomValues(arr);
        var result = '';
        for (var i = 0; i < length; i++) {
            result += charset[arr[i] % charset.length];
        }
        return result;
    }

    function copyPassword(value, btn) {
        navigator.clipboard.writeText(value).then(function() {
            btn.textContent = labelCopied;
            btn.style.background = 'var(--primary-500, #3b82f6)';
            btn.style.borderColor = 'var(--primary-500, #3b82f6)';
            btn.style.color = '#fff';
            setTimeout(function() {
                btn.textContent = labelCopy;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 1500);
        });
    }

    function generate() {
        if (!outputEl) return;
        var length = parseInt(lengthEl ? lengthEl.value : 16);
        var count  = parseInt(countEl ? countEl.value : 1);
        count = Math.max(1, Math.min(20, count));

        var charset = '';
        if (upperEl   && upperEl.checked)   charset += UPPER;
        if (lowerEl   && lowerEl.checked)   charset += LOWER;
        if (numbersEl && numbersEl.checked) charset += NUMBERS;
        if (symbolsEl && symbolsEl.checked) charset += SYMBOLS;
        if (!charset) charset = LOWER;

        outputEl.innerHTML = '';
        for (var i = 0; i < count; i++) {
            var pass     = generatePassword(length, charset);
            var strength = getStrength(pass);

            var row = document.createElement('div');
            row.className = 'passgen-row';

            var valEl = document.createElement('span');
            valEl.className = 'passgen-value';
            valEl.textContent = pass;

            var strEl = document.createElement('span');
            strEl.className = 'passgen-strength ' + strength.cls;
            strEl.textContent = strength.label;

            var btn = document.createElement('button');
            btn.className = 'passgen-copy-btn';
            btn.textContent = labelCopy;
            (function(p, b) {
                b.addEventListener('click', function() { copyPassword(p, b); });
            })(pass, btn);

            row.appendChild(valEl);
            row.appendChild(strEl);
            row.appendChild(btn);
            outputEl.appendChild(row);
        }
    }

    if (generateBtn) generateBtn.addEventListener('click', generate);
    generate();

    // ===== MD5 / Hash Tool =====

    var hasherInputEl  = document.getElementById('hasherInput');
    var hasherOutputEl = document.getElementById('hasherOutput');

    // Pure JS MD5 implementation (RFC 1321)
    function md5(str) {
        function safeAdd(x, y) { var lsw=(x&0xffff)+(y&0xffff); var msw=(x>>16)+(y>>16)+(lsw>>16); return (msw<<16)|(lsw&0xffff); }
        function bitRotateLeft(num, cnt) { return (num<<cnt)|(num>>>(32-cnt)); }
        function md5cmn(q,a,b,x,s,t){ return safeAdd(bitRotateLeft(safeAdd(safeAdd(a,q),safeAdd(x,t)),s),b); }
        function md5ff(a,b,c,d,x,s,t){ return md5cmn((b&c)|((~b)&d),a,b,x,s,t); }
        function md5gg(a,b,c,d,x,s,t){ return md5cmn((b&d)|(c&(~d)),a,b,x,s,t); }
        function md5hh(a,b,c,d,x,s,t){ return md5cmn(b^c^d,a,b,x,s,t); }
        function md5ii(a,b,c,d,x,s,t){ return md5cmn(c^(b|(~d)),a,b,x,s,t); }
        function md5blks(s) {
            var nblk=((s.length+8)>>6)+1, blks=new Array(nblk*16);
            for(var i=0;i<nblk*16;i++) blks[i]=0;
            for(var i=0;i<s.length;i++) blks[i>>2]|=s.charCodeAt(i)<<((i%4)*8);
            blks[s.length>>2]|=0x80<<((s.length%4)*8);
            blks[nblk*16-2]=s.length*8; return blks;
        }
        var m=md5blks(str), a=1732584193, b=-271733879, c=-1732584194, d=271733878;
        for(var i=0;i<m.length;i+=16){
            var aa=a,bb=b,cc=c,dd=d;
            a=md5ff(a,b,c,d,m[i+0],7,-680876936);   d=md5ff(d,a,b,c,m[i+1],12,-389564586);
            c=md5ff(c,d,a,b,m[i+2],17,606105819);    b=md5ff(b,c,d,a,m[i+3],22,-1044525330);
            a=md5ff(a,b,c,d,m[i+4],7,-176418897);    d=md5ff(d,a,b,c,m[i+5],12,1200080426);
            c=md5ff(c,d,a,b,m[i+6],17,-1473231341);  b=md5ff(b,c,d,a,m[i+7],22,-45705983);
            a=md5ff(a,b,c,d,m[i+8],7,1770035416);    d=md5ff(d,a,b,c,m[i+9],12,-1958414417);
            c=md5ff(c,d,a,b,m[i+10],17,-42063);      b=md5ff(b,c,d,a,m[i+11],22,-1990404162);
            a=md5ff(a,b,c,d,m[i+12],7,1804603682);   d=md5ff(d,a,b,c,m[i+13],12,-40341101);
            c=md5ff(c,d,a,b,m[i+14],17,-1502002290); b=md5ff(b,c,d,a,m[i+15],22,1236535329);
            a=md5gg(a,b,c,d,m[i+1],5,-165796510);    d=md5gg(d,a,b,c,m[i+6],9,-1069501632);
            c=md5gg(c,d,a,b,m[i+11],14,643717713);   b=md5gg(b,c,d,a,m[i+0],20,-373897302);
            a=md5gg(a,b,c,d,m[i+5],5,-701558691);    d=md5gg(d,a,b,c,m[i+10],9,38016083);
            c=md5gg(c,d,a,b,m[i+15],14,-660478335);  b=md5gg(b,c,d,a,m[i+4],20,-405537848);
            a=md5gg(a,b,c,d,m[i+9],5,568446438);     d=md5gg(d,a,b,c,m[i+14],9,-1019803690);
            c=md5gg(c,d,a,b,m[i+3],14,-187363961);   b=md5gg(b,c,d,a,m[i+8],20,1163531501);
            a=md5gg(a,b,c,d,m[i+13],5,-1444681467);  d=md5gg(d,a,b,c,m[i+2],9,-51403784);
            c=md5gg(c,d,a,b,m[i+7],14,1735328473);   b=md5gg(b,c,d,a,m[i+12],20,-1926607734);
            a=md5hh(a,b,c,d,m[i+5],4,-378558);        d=md5hh(d,a,b,c,m[i+8],11,-2022574463);
            c=md5hh(c,d,a,b,m[i+11],16,1839030562);  b=md5hh(b,c,d,a,m[i+14],23,-35309556);
            a=md5hh(a,b,c,d,m[i+1],4,-1530992060);   d=md5hh(d,a,b,c,m[i+4],11,1272893353);
            c=md5hh(c,d,a,b,m[i+7],16,-155497632);   b=md5hh(b,c,d,a,m[i+10],23,-1094730640);
            a=md5hh(a,b,c,d,m[i+13],4,681279174);     d=md5hh(d,a,b,c,m[i+0],11,-358537222);
            c=md5hh(c,d,a,b,m[i+3],16,-722521979);    b=md5hh(b,c,d,a,m[i+6],23,76029189);
            a=md5hh(a,b,c,d,m[i+9],4,-640364487);     d=md5hh(d,a,b,c,m[i+12],11,-421815835);
            c=md5hh(c,d,a,b,m[i+15],16,530742520);    b=md5hh(b,c,d,a,m[i+2],23,-995338651);
            a=md5ii(a,b,c,d,m[i+0],6,-198630844);     d=md5ii(d,a,b,c,m[i+7],10,1126891415);
            c=md5ii(c,d,a,b,m[i+14],15,-1416354905);  b=md5ii(b,c,d,a,m[i+5],21,-57434055);
            a=md5ii(a,b,c,d,m[i+12],6,1700485571);    d=md5ii(d,a,b,c,m[i+3],10,-1894986606);
            c=md5ii(c,d,a,b,m[i+10],15,-1051523);     b=md5ii(b,c,d,a,m[i+1],21,-2054922799);
            a=md5ii(a,b,c,d,m[i+8],6,1873313359);     d=md5ii(d,a,b,c,m[i+15],10,-30611744);
            c=md5ii(c,d,a,b,m[i+6],15,-1560198380);   b=md5ii(b,c,d,a,m[i+13],21,1309151649);
            a=md5ii(a,b,c,d,m[i+4],6,-145523070);     d=md5ii(d,a,b,c,m[i+11],10,-1120210379);
            c=md5ii(c,d,a,b,m[i+2],15,718787259);     b=md5ii(b,c,d,a,m[i+9],21,-343485551);
            a=safeAdd(a,aa); b=safeAdd(b,bb); c=safeAdd(c,cc); d=safeAdd(d,dd);
        }
        function hex(n) { var s='', v; for(var j=0;j<4;j++){v=(n>>>(j*8))&0xff; s+=(v<16?'0':'')+v.toString(16);} return s; }
        return hex(a)+hex(b)+hex(c)+hex(d);
    }

    function bufToHex(buf) {
        return Array.from(new Uint8Array(buf)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
    }

    function hashSHA(algo, text) {
        var enc = new TextEncoder();
        return crypto.subtle.digest(algo, enc.encode(text)).then(function(buf){ return bufToHex(buf); });
    }

    function copyHash(value, btn) {
        navigator.clipboard.writeText(value).then(function() {
            var orig = btn.textContent;
            btn.textContent = labelCopied;
            btn.style.background = 'var(--primary-500, #3b82f6)';
            btn.style.borderColor = 'var(--primary-500, #3b82f6)';
            btn.style.color = '#fff';
            setTimeout(function() {
                btn.textContent = orig;
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
            }, 1500);
        });
    }

    function makeHashRow(algo, hashValue) {
        var row = document.createElement('div');
        row.className = 'hasher-row';

        var algoEl = document.createElement('span');
        algoEl.className = 'hasher-algo';
        algoEl.textContent = algo;

        var valEl = document.createElement('span');
        valEl.className = 'hasher-value';
        valEl.textContent = hashValue;

        var btn = document.createElement('button');
        btn.className = 'hasher-copy-btn';
        btn.textContent = labelCopy;
        btn.addEventListener('click', function(){ copyHash(hashValue, btn); });

        row.appendChild(algoEl);
        row.appendChild(valEl);
        row.appendChild(btn);
        return row;
    }

    function runHasher() {
        if (!hasherOutputEl) return;
        var text = hasherInputEl ? hasherInputEl.value : '';

        hasherOutputEl.innerHTML = '';

        if (!text) {
            var empty = document.createElement('p');
            empty.className = 'hasher-empty';
            empty.textContent = hasherInputEl ? hasherInputEl.getAttribute('placeholder') : '';
            hasherOutputEl.appendChild(empty);
            return;
        }

        // MD5 — synchronous pure JS
        var md5hash = md5(text);
        hasherOutputEl.appendChild(makeHashRow('MD5', md5hash));

        // SHA hashes via SubtleCrypto — async
        var algos = [['SHA-1','SHA-1'],['SHA-256','SHA-256'],['SHA-512','SHA-512']];
        algos.forEach(function(pair) {
            var label = pair[0], algo = pair[1];
            var row = document.createElement('div');
            row.className = 'hasher-row';
            var algoEl = document.createElement('span');
            algoEl.className = 'hasher-algo';
            algoEl.textContent = label;
            var valEl = document.createElement('span');
            valEl.className = 'hasher-value';
            valEl.textContent = '...';
            var btn = document.createElement('button');
            btn.className = 'hasher-copy-btn';
            btn.textContent = labelCopy;
            row.appendChild(algoEl);
            row.appendChild(valEl);
            row.appendChild(btn);
            hasherOutputEl.appendChild(row);

            hashSHA(algo, text).then(function(hash) {
                valEl.textContent = hash;
                btn.addEventListener('click', function(){ copyHash(hash, btn); });
            });
        });
    }

    if (hasherInputEl) {
        hasherInputEl.addEventListener('input', runHasher);
    }
    runHasher();

    // ===== Hash Verifier =====

    var verifyPlainEl  = document.getElementById('verifyPlain');
    var verifyHashEl   = document.getElementById('verifyHash');
    var verifyResultEl = document.getElementById('verifyResult');
    var verifyPillsEl  = document.getElementById('verifyAlgoPills');
    var verifyAlgo     = 'MD5';

    // Algo pill selection
    if (verifyPillsEl) {
        verifyPillsEl.addEventListener('click', function(e) {
            var pill = e.target.closest('.verify-algo-pill');
            if (!pill) return;
            verifyPillsEl.querySelectorAll('.verify-algo-pill').forEach(function(p) { p.classList.remove('is-active'); });
            pill.classList.add('is-active');
            verifyAlgo = pill.dataset.algo;
            runVerify();
        });
    }

    function showVerifyResult(type, msg, sub) {
        if (!verifyResultEl) return;
        var iconMatch    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        var iconNoMatch  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        var iconPending  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        var icon = type === 'match' ? iconMatch : (type === 'no-match' ? iconNoMatch : iconPending);
        var text = sub ? '<span>' + msg + '</span><small style="font-weight:400;font-size:0.78rem;opacity:0.75;margin-left:0.5rem;">' + sub + '</small>' : '<span>' + msg + '</span>';
        verifyResultEl.innerHTML = '<div class="verify-result-box ' + type + '">' + icon + '<div>' + text + '</div></div>';
    }

    function runVerify() {
        if (!verifyPlainEl || !verifyHashEl) return;
        var plain = verifyPlainEl.value.trim();
        var hash  = verifyHashEl.value.trim().toLowerCase();

        if (!plain || !hash) {
            verifyResultEl.innerHTML = '';
            return;
        }

        if (verifyAlgo === 'MD5') {
            var computed = md5(plain);
            if (computed === hash) {
                showVerifyResult('match', 'Hash matches!', 'MD5: ' + computed);
            } else {
                showVerifyResult('no-match', 'Hash does not match', 'Expected: ' + computed);
            }
        } else {
            showVerifyResult('pending', 'Verifying...', '');
            hashSHA(verifyAlgo, plain).then(function(computed) {
                if (computed === hash) {
                    showVerifyResult('match', 'Hash matches!', verifyAlgo + ': ' + computed);
                } else {
                    showVerifyResult('no-match', 'Hash does not match', 'Expected: ' + computed);
                }
            });
        }
    }

    if (verifyPlainEl) verifyPlainEl.addEventListener('input', runVerify);
    if (verifyHashEl)  verifyHashEl.addEventListener('input', runVerify);

    // ===== bcrypt Generator & Verifier =====
    // Uses bcryptjs library (loaded from CDN)

    var BCRYPT = (function() {
        // Wraps bcryptjs library (dcodeIO/bcryptjs, loaded from CDN)
        var lib = (typeof dcodeIO !== "undefined" && dcodeIO.bcrypt) || (typeof window !== "undefined" && window.bcrypt) || null;

        function hash(password, rounds) {
            if (!lib) throw new Error("bcryptjs not loaded");
            var salt = lib.genSaltSync(rounds);
            return lib.hashSync(password, salt);
        }

        function verify(password, hashed) {
            if (!lib) throw new Error("bcryptjs not loaded");
            return lib.compareSync(password, hashed);
        }

        return { hash: hash, verify: verify };
    })();

    // bcrypt UI
    var bcryptInputEl       = document.getElementById('bcryptInput');
    var bcryptCostEl        = document.getElementById('bcryptCost');
    var bcryptCostValEl     = document.getElementById('bcryptCostVal');
    var bcryptGenBtnEl      = document.getElementById('bcryptGenBtn');
    var bcryptOutputEl      = document.getElementById('bcryptOutput');
    var bcryptVerifyPlainEl = document.getElementById('bcryptVerifyPlain');
    var bcryptVerifyHashEl  = document.getElementById('bcryptVerifyHash');
    var bcryptVerifyBtnEl   = document.getElementById('bcryptVerifyBtn');
    var bcryptVerifyResEl   = document.getElementById('bcryptVerifyResult');

    if (bcryptCostEl && bcryptCostValEl) {
        bcryptCostEl.addEventListener('input', function() {
            bcryptCostValEl.textContent = bcryptCostEl.value;
        });
    }

    function showBcryptVerifyResult(type, msg, sub) {
        if (!bcryptVerifyResEl) return;
        var iconMatch   = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>';
        var iconNoMatch = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
        var iconWait    = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>';
        var icon = type === 'match' ? iconMatch : (type === 'no-match' ? iconNoMatch : iconWait);
        var text = sub
            ? '<span>' + msg + '</span><small style="font-weight:400;font-size:0.78rem;opacity:0.75;margin-left:0.5rem;">' + sub + '</small>'
            : '<span>' + msg + '</span>';
        bcryptVerifyResEl.innerHTML = '<div class="verify-result-box ' + type + '">' + icon + '<div>' + text + '</div></div>';
    }

    if (bcryptGenBtnEl) {
        bcryptGenBtnEl.addEventListener('click', function() {
            var password = bcryptInputEl ? bcryptInputEl.value : '';
            if (!password) return;
            var cost = bcryptCostEl ? parseInt(bcryptCostEl.value) : 10;

            // Show spinner
            bcryptOutputEl.innerHTML = '<div class="bcrypt-spinner">Hashing...</div>';
            bcryptGenBtnEl.disabled = true;

            // Use setTimeout to let the spinner render before blocking computation
            setTimeout(function() {
                try {
                    var hashed = BCRYPT.hash(password, cost);
                    bcryptOutputEl.innerHTML = '';
                    var row = document.createElement('div');
                    row.className = 'bcrypt-hash-row';

                    var algoEl = document.createElement('span');
                    algoEl.className = 'hasher-algo';
                    algoEl.textContent = 'bcrypt';

                    var valEl = document.createElement('span');
                    valEl.className = 'bcrypt-hash-value';
                    valEl.textContent = hashed;

                    var btn = document.createElement('button');
                    btn.className = 'hasher-copy-btn';
                    btn.textContent = labelCopy;
                    btn.addEventListener('click', function() { copyHash(hashed, btn); });

                    row.appendChild(algoEl);
                    row.appendChild(valEl);
                    row.appendChild(btn);
                    bcryptOutputEl.appendChild(row);
                } catch(e) {
                    bcryptOutputEl.innerHTML = '<p style="color:#dc2626;font-size:0.85rem;">Error: ' + e.message + '</p>';
                }
                bcryptGenBtnEl.disabled = false;
            }, 30);
        });
    }

    if (bcryptVerifyBtnEl) {
        bcryptVerifyBtnEl.addEventListener('click', function() {
            var plain = bcryptVerifyPlainEl ? bcryptVerifyPlainEl.value : '';
            var hashed = bcryptVerifyHashEl ? bcryptVerifyHashEl.value.trim() : '';
            if (!plain || !hashed) return;

            showBcryptVerifyResult('pending', 'Verifying...', '');
            bcryptVerifyBtnEl.disabled = true;

            setTimeout(function() {
                try {
                    var match = BCRYPT.verify(plain, hashed);
                    if (match) {
                        showBcryptVerifyResult('match', 'Hash matches!', 'bcrypt verified');
                    } else {
                        showBcryptVerifyResult('no-match', 'Hash does not match', 'bcrypt');
                    }
                } catch(e) {
                    showBcryptVerifyResult('no-match', 'Invalid bcrypt hash', e.message);
                }
                bcryptVerifyBtnEl.disabled = false;
            }, 30);
        });
    }

})();
