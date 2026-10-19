# Localization — stable message keys and Greek plurals

## Scenario and acceptance criteria
An offline interface shows the number of files found in English and Greek. It uses one stable message key with singular and plural variants, not text literals scattered across UI components. Both languages must require the same count placeholder, and unknown locale codes must fail explicitly rather than displaying a misleading partial translation.

## Executable lab
Save as `17_localization.py` and run with Python 3 and the standard library. The fixture does not use real personal files or network services.

~~~python
from string import Formatter
MESSAGES = {
  "en": {"one":"Found {count} file","many":"Found {count} files"},
  "el": {"one":"Βρέθηκε {count} αρχείο","many":"Βρέθηκαν {count} αρχεία"},
}
def placeholders(value):
    return {name for _,name,_,_ in Formatter().parse(value) if name}
def message(locale, count):
    if locale not in MESSAGES or type(count) is not int or count < 0:
        raise ValueError("invalid locale or count")
    form = "one" if count == 1 else "many"
    template = MESSAGES[locale][form]
    if placeholders(template) != {"count"}:
        raise ValueError("translation placeholders differ")
    return template.format(count=count)
assert message("en",1) == "Found 1 file"
assert message("el",2) == "Βρέθηκαν 2 αρχεία"
assert message("el",0) == "Βρέθηκαν 0 αρχεία"
try: message("xx",1)
except ValueError: pass
else: raise AssertionError("unknown locale accepted")
print("PASS bilingual plural and placeholder checks")
~~~

## Technical interpretation
Grammar is not just word-for-word substitution: one file takes English 'file' and Greek 'αρχείο', whereas two take 'files' and 'αρχεία'. The fixture uses this bounded one-versus-many rule only; production applications must use CLDR plural categories, including languages with more forms. Keep numeric values separate from translated templates. HTML escaping and accessible labels still apply when displaying translated strings.

## Bounded experiments
Add a third language that has different plural categories and explain why this simple implementation must be replaced with an internationalization library. Delete the count placeholder from one Greek string and confirm the placeholder check rejects it. Test Greek accents, UTF-8 file loading, right-to-left layouts and truncation of long translations in the actual browser.

## Diagnostics
If a language toggle displays mixed languages, trace missing keys and stale cached bundles rather than adding fallback text silently. If numbers or dates look wrong, use locale-aware number and date formatting; this example handles plural text only. Keep accessibility labels translated along with visible titles.
