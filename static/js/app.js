document.addEventListener('DOMContentLoaded', function() {
    const htmlEditor = CodeMirror(document.getElementById('html-editor'), {
        mode: 'htmlmixed',
        theme: 'dracula',
        lineNumbers: true,
        autofocus: true
    });

    const acssConfigEditor = CodeMirror(document.getElementById('acss-config-editor'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true
    });

    const cssOutputEditor = CodeMirror(document.getElementById('css-output'), {
        mode: 'css',
        theme: 'dracula',
        lineNumbers: true,
        readOnly: true
    });

    const previewFrame = document.getElementById('preview-frame');

    // Initialize ACSS Config with a valid JSON object
    acssConfigEditor.setValue(JSON.stringify({
        breakPoints: {
            sm: '@media(min-width:750px)',
            md: '@media(min-width:1000px)',
            lg: '@media(min-width:1200px)'
        },
        custom: {
            'primary': '#1c7ef6',
            'secondary': '#f65e1c'
        }
    }, null, 2));

    // Initialize HTML editor with a sample ACSS class
    htmlEditor.setValue('<div class="P(20px) C(#ff0000)">Hello, ACSS!</div>');

    // Refresh CodeMirror instances to ensure proper rendering
    setTimeout(() => {
        htmlEditor.refresh();
        acssConfigEditor.refresh();
        cssOutputEditor.refresh();
    }, 100);

    function updateOutputAndPreview() {
        console.log('updateOutputAndPreview called');
        const html = htmlEditor.getValue();
        const config = acssConfigEditor.getValue();
        console.log('HTML:', html);
        console.log('Config:', config);

        if (!html.trim()) {
            console.log('HTML is empty, not sending request');
            cssOutputEditor.setValue('No HTML input');
            updatePreview('', '');
            return;
        }

        console.log('Sending fetch request to /process_acss');
        fetch('/process_acss', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ html, config })
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data.error) {
                console.error('Error:', data.error);
                cssOutputEditor.setValue('Error: ' + data.error);
                return;
            }

            console.log('Setting CSS output:', data.css);
            if (data.css) {
                cssOutputEditor.setValue(data.css);
                updatePreview(html, data.css);
            } else {
                console.error('No CSS data received');
                cssOutputEditor.setValue('No CSS generated');
            }
            
            // Display Atomizer version
            document.getElementById('atomizer-version').textContent = `Atomizer version: ${data.version}`;
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            cssOutputEditor.setValue('Error: ' + error.message);
        });
    }

    function updatePreview(html, css) {
        console.log('Updating preview');
        const previewContent = `
            <html>
                <head>
                    <style>${css}</style>
                </head>
                <body style="background-color: #1e1e1e; color: #e0e0e0;">${html}</body>
            </html>
        `;
        previewFrame.srcdoc = previewContent;
    }

    htmlEditor.on('change', () => {
        console.log('HTML changed');
        updateOutputAndPreview();
    });
    acssConfigEditor.on('change', () => {
        console.log('ACSS Config changed');
        updateOutputAndPreview();
    });

    // Initial update
    updateOutputAndPreview();
});
