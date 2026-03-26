from flask import Flask, request, render_template, send_file
import os
import requests

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
TEMPLATE_DIR = os.path.join(BASE_DIR, 'resume_template')
OUTPUT_DIR = os.path.join(BASE_DIR, 'outputs')

os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.get_json()

    template_path = os.path.join(TEMPLATE_DIR, 'jake_resume.tex')
    with open(template_path, 'r') as f:
        tex = f.read()

    tex = fill_template(tex, data)

    response = requests.post(
        'https://latexonline.cc/compile',
        files={'file': ('resume.tex', tex.encode('utf-8'), 'application/x-tex')}
    )

    if response.status_code != 200 or 'application/pdf' not in response.headers.get('Content-Type', ''):
        return {'error': 'PDF generation failed', 'details': response.text}, 500

    pdf_path = os.path.join(OUTPUT_DIR, 'resume.pdf')
    with open(pdf_path, 'wb') as f:
        f.write(response.content)

    return send_file(pdf_path, as_attachment=True, download_name='resume.pdf', mimetype='application/pdf')


def fill_template(tex, data):
    tex = tex.replace('{{full_name}}', data.get('full_name', ''))
    tex = tex.replace('{{phone}}', data.get('phone', ''))
    tex = tex.replace('{{email}}', data.get('email', ''))
    tex = tex.replace('{{linkedin}}', data.get('linkedin', ''))
    tex = tex.replace('{{github}}', data.get('github', ''))

    education_latex = ''
    for edu in data.get('education', []):
        education_latex += f"""
    \\resumeSubheading
      {{{edu['institution']}}}{{{edu['location']}}}
      {{{edu['degree']}}}{{{edu['start_date']} -- {edu['end_date']}}}"""
    tex = tex.replace('{{education}}', education_latex)

    experience_latex = ''
    for exp in data.get('experience', []):
        bullets = '\n'.join([f'        \\resumeItem{{{b}}}' for b in exp['bullets']])
        experience_latex += f"""
    \\resumeSubheading
      {{{exp['title']}}}{{{exp['start_date']} -- {exp['end_date']}}}
      {{{exp['company']}}}{{{exp['location']}}}
      \\resumeItemListStart
{bullets}
      \\resumeItemListEnd"""
    tex = tex.replace('{{experience}}', experience_latex)

    projects_latex = ''
    for proj in data.get('projects', []):
        bullets = '\n'.join([f'        \\resumeItem{{{b}}}' for b in proj['bullets']])
        projects_latex += f"""
    \\resumeProjectHeading
      {{\\textbf{{{proj['name']}}} $|$ \\emph{{{proj['tech_stack']}}}}}{{{proj['date']}}}
      \\resumeItemListStart
{bullets}
      \\resumeItemListEnd"""
    tex = tex.replace('{{projects}}', projects_latex)

    skills = data.get('skills', {})
    tex = tex.replace('{{languages}}', skills.get('languages', ''))
    tex = tex.replace('{{frameworks}}', skills.get('frameworks', ''))
    tex = tex.replace('{{tools}}', skills.get('tools', ''))
    tex = tex.replace('{{libraries}}', skills.get('libraries', ''))

    return tex


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
```

And `requirements.txt`:
```
flask
requests