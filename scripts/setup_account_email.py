#!/usr/bin/env python3
"""Configure only the existing Test Worker's email secrets. No mail is sent.

Credentials are read from Actions secrets through the environment, never files,
command arguments, output, artifacts, or the public website. No plan changes.
"""
import json, os, re, sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

ACCOUNT = '3186441280053d723e7c85dc8ef3acc9'
WORKER = 'dedsec-test-accounts'
BASE = f'https://api.cloudflare.com/client/v4/accounts/{ACCOUNT}/workers/scripts/{WORKER}'

def api(method, suffix='', data=None):
    req = Request(BASE + suffix, method=method,
                  headers={'Authorization': 'Bearer ' + os.environ['CLOUDFLARE_API_TOKEN'],
                           'Content-Type': 'application/json'},
                  data=None if data is None else json.dumps(data).encode())
    try:
        with urlopen(req, timeout=30) as response:
            result = json.load(response)
    except (HTTPError, URLError, TimeoutError):
        raise RuntimeError('Cloudflare request failed. Check token scope and the existing Test Worker; no response body was logged.') from None
    if result.get('success') is not True:
        raise RuntimeError('Cloudflare did not confirm success; inspect the dashboard before retrying.')
    return result.get('result')

def main():
    if os.environ.get('GITHUB_REPOSITORY') != 'dedsec1121fk/Test' or os.environ.get('GITHUB_REF') != 'refs/heads/main':
        raise RuntimeError('This setup is limited to Test/main. It never changes main or backup hosting.')
    if not os.environ.get('CLOUDFLARE_API_TOKEN'):
        raise RuntimeError('Set the CLOUDFLARE_API_TOKEN Actions secret with Workers Scripts Edit access for the existing account.')
    names = {x['name'] for x in api('GET', '/secrets')}
    wanted = {'MAIL_PROVIDER', 'ACCOUNT_PUBLIC_ORIGIN', 'MAIL_API_KEY', 'MAIL_FROM'}
    if names & wanted and not wanted <= names and os.environ.get('REPLACE_EMAIL_SECRETS') != 'true':
        raise RuntimeError('Partial or legacy email bindings exist. Set replace_existing=true with a matching provider and key; no bindings changed.')
    if wanted <= names and os.environ.get('REPLACE_EMAIL_SECRETS') != 'true':
        print('Email secrets already exist. Nothing changed. Use the account verification button to test delivery.')
        return
    key = os.environ.get('MAIL_API_KEY', '').strip()
    sender = os.environ.get('MAIL_FROM', '').strip()
    provider = os.environ.get('MAIL_PROVIDER', 'brevo').strip()
    origin = os.environ.get('ACCOUNT_PUBLIC_ORIGIN', 'https://dedsec-test-accounts.dedsec-project.workers.dev').strip()
    from urllib.parse import urlsplit
    parsed = urlsplit(origin)
    if provider not in {'brevo', 'resend'} or parsed.scheme != 'https' or not parsed.netloc or parsed.username or parsed.password or parsed.path not in {'', '/'} or parsed.query or parsed.fragment:
        raise RuntimeError('Invalid provider or account origin; nothing changed.')
    if not key or not sender:
        raise RuntimeError('Set MAIL_API_KEY and MAIL_FROM Actions secrets from your selected email provider and verified domain sender. This workflow cannot create provider credentials.')
    if any(c in sender + key for c in '\r\n\x00') or not re.fullmatch(r'(?:[^<>]+ <)?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+>?', sender):
        raise RuntimeError('Invalid email secret format. Values were not logged.')
    # Each endpoint changes only its named binding. Other auth/reward secrets,
    # D1 bindings and Worker code are retained. No account/project is created.
    for name, value in [('MAIL_PROVIDER', provider), ('ACCOUNT_PUBLIC_ORIGIN', origin.rstrip('/')), ('MAIL_FROM', sender), ('MAIL_API_KEY', key)]:
        if name not in names or os.environ.get('REPLACE_EMAIL_SECRETS') == 'true':
            api('PUT', '/secrets', {'name': name, 'text': value, 'type': 'secret_text'})
            print(name + ' configured on the existing Test Worker.')
    if not wanted <= {x['name'] for x in api('GET', '/secrets')}:
        raise RuntimeError('Email setup is incomplete. Inspect existing bindings before retrying.')
    print('All email bindings exist. No email was sent and no paid service was enabled. Test delivery from your own account.')

if __name__ == '__main__':
    try:
        main()
    except (RuntimeError, KeyError) as exc:
        print('EMAIL_SETUP: ' + str(exc), file=sys.stderr)
        sys.exit(1)

