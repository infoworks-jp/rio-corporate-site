"""Generate static, crawlable recruitment pages from reviewed employer copy.

Keep datePosted as the ORIGINAL source date, never the regeneration date.
Remove ended jobs from jobs.json and regenerate; retain validThrough where known.
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://rio-works.com'
REVIEWED = '2026-09-20'
JOBS = json.loads((ROOT / 'recruit/jobs.json').read_text())
esc = html.escape

def head(title, description, path, schema=None):
    structured = '' if schema is None else '<script type="application/ld+json">' + json.dumps(schema, ensure_ascii=False).replace('<', '\\u003c') + '</script>'
    return f'''<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>{esc(title)}</title><meta name="description" content="{esc(description, quote=True)}">
<meta name="robots" content="index,follow,max-image-preview:large"><link rel="canonical" href="{BASE}{path}">
<link rel="icon" href="/favicon.ico?v=20260915-brush"><link rel="stylesheet" href="/recruit/jobs.css?v=20260920-jobs1"><meta name="theme-color" content="#eee8dc">
<meta property="og:type" content="website"><meta property="og:locale" content="ja_JP"><meta property="og:site_name" content="株式会社吏央"><meta property="og:title" content="{esc(title, quote=True)}"><meta property="og:description" content="{esc(description, quote=True)}"><meta property="og:url" content="{BASE}{path}">
{structured}</head><body><a class="skip-link" href="#main">本文へ進む</a>
<header class="masthead"><a class="brand" href="/"><b>株式会社 吏央<span class="seal-dot" aria-hidden="true">●</span></b><span>RIO CO., LTD.</span></a><nav aria-label="サイト案内"><a href="/recruit/">採用情報</a><a href="/sapporo/">札幌本社</a><a href="/yokohama/">横浜支店</a></nav></header>'''

FOOT = '<footer class="wrap"><div><b>株式会社 吏央</b><span>RIO CO., LTD.</span></div><nav aria-label="フッター"><a href="/">公式ホームページ</a><a href="/recruit/">募集一覧</a><a href="/#contact">お問い合わせ</a></nav></footer></body></html>\n'

def wage(job):
    return f'日給{job["salaryMin"]:,}円～{job["salaryMax"]:,}円'

def actions(job):
    return f'<div class="actions"><a class="button" href="{esc(job["applyUrl"], quote=True)}" target="_blank" rel="noopener noreferrer">Indeedで募集要項・応募先を確認 ↗</a><a class="text-link" href="tel:{job["phone"].replace("-", "")}">電話で応募・相談 {job["phone"]}</a></div>'

for job in JOBS:
    path = '/recruit/' + job['slug'] + '/'
    title = f'{job["title"]}の求人｜{job["office"]}｜株式会社吏央'
    description = f'株式会社吏央 {job["office"]}の正社員募集。{wage(job)}。{job["intro"]}'
    sections = ''.join('<section class="job-section"><h2>' + esc(s['title']) + '</h2>' + ''.join('<p>' + esc(p) + '</p>' for p in s['paragraphs']) + '</section>' for s in job['sections'])
    # Same employer text is visible on the page and in JobPosting.description.
    schema_description = '<p>雇用主：株式会社吏央。雇用形態：正社員。</p>' + ''.join('<p>' + esc(s['title']) + '</p>' + ''.join('<p>' + esc(p) + '</p>' for p in s['paragraphs']) for s in job['sections'])
    schema = {
        '@context': 'https://schema.org', '@type': 'JobPosting',
        '@id': BASE + path + '#job', 'url': BASE + path,
        'title': job['title'], 'description': schema_description,
        'datePosted': job['datePosted'], 'employmentType': 'FULL_TIME',
        'identifier': {'@type': 'PropertyValue', 'name': '株式会社吏央', 'value': job['identifier']},
        'hiringOrganization': {'@type': 'Organization', 'name': '株式会社吏央', 'sameAs': BASE + '/', 'logo': BASE + '/assets/site/rio-hero-logo.png'},
        'jobLocation': {'@type': 'Place', 'name': '株式会社吏央 ' + job['office'], 'address': {'@type': 'PostalAddress', 'addressCountry': 'JP', 'addressRegion': job['region'], 'addressLocality': job['locality'], 'streetAddress': job['street'], 'postalCode': job['postalCode']}},
        'baseSalary': {'@type': 'MonetaryAmount', 'currency': 'JPY', 'value': {'@type': 'QuantitativeValue', 'minValue': job['salaryMin'], 'maxValue': job['salaryMax'], 'unitText': 'DAY'}},
        'educationRequirements': 'no requirements',
    }
    expiry = ''
    if job.get('validThrough'):
        schema['validThrough'] = job['validThrough']
        expiry = '｜紹介期限：' + job['validThrough'][:10].replace('-', '/')
    dates = f'元求人の掲載開始：{job["datePosted"].replace("-", "/")} {expiry}｜内容確認：{REVIEWED.replace("-", "/")}'
    page = head(title, description, path, schema) + f'''<main class="wrap job-main" id="main">
<nav class="breadcrumbs" aria-label="パンくずリスト"><a href="/">ホーム</a><span>/</span><a href="/recruit/">採用情報</a><span>/</span><span aria-current="page">{esc(job['office'])}・{esc(job['title'])}</span></nav>
<div class="job-hero"><div><p class="eyebrow">{esc(job['office'])} ／ 正社員</p><h1>{esc(job['title'])}</h1><p class="job-salary">{wage(job)}</p><p class="job-intro">{esc(job['intro'])}</p><p class="job-dates">{dates}</p>{actions(job)}</div><img src="/assets/site/{job['photo']}" alt="株式会社吏央 {job['office']}" width="449" height="323"></div>
<div class="job-sections">{sections}</div><section class="apply-box" id="apply"><h2>応募・お問い合わせ</h2><p>株式会社吏央 {esc(job['office'])} 採用窓口</p>{actions(job)}<p>勤務開始日や寮についてもご相談ください。</p></section>
<p class="job-note"><a class="source-link" href="{esc(job['source'], quote=True)}" target="_blank" rel="noopener noreferrer">掲載中の元の募集要項を確認する ↗</a>。募集状況や個別の条件は、応募時に採用窓口へご確認ください。</p></main>''' + FOOT
    output = ROOT / path.strip('/') / 'index.html'
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(page)

cards = ''
for job in JOBS:
    cards += f'''<article class="job-card"><p class="eyebrow">{job['office']} ／ 正社員</p><a href="/recruit/{job['slug']}/"><h2>{esc(job['title'])}</h2></a><p class="job-salary">{wage(job)}</p><p>{esc(job['intro'])}</p><div class="actions"><a class="button" href="/recruit/{job['slug']}/">募集要項・応募方法を見る →</a></div></article>'''
listing = head('採用情報・求人一覧｜札幌・横浜｜株式会社吏央', '株式会社吏央の正社員求人。札幌の土木作業スタッフ（経験者・未経験者）、横浜の土工。給与、仕事内容、勤務地、寮、応募方法をご確認いただけます。', '/recruit/')
listing += f'''<main class="wrap job-main" id="main"><nav class="breadcrumbs" aria-label="パンくずリスト"><a href="/">ホーム</a><span>/</span><span aria-current="page">採用情報</span></nav><p class="eyebrow">株式会社吏央 ／ 札幌・横浜</p><h1>採用情報</h1><p class="job-intro">仕事内容や給与、勤務地を確認して、希望する募集へご応募ください。経験者も未経験の方も、それぞれに合う仕事の始め方をご相談いただけます。</p><div class="job-list">{cards}</div><p class="job-note">各求人は掲載中の募集要項をもとにご案内しています。詳しい条件は各ページからご確認ください。</p></main>''' + FOOT
(ROOT / 'recruit/index.html').write_text(listing)
print('Generated recruitment index and', len(JOBS), 'job detail pages.')
