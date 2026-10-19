from copy import deepcopy

def merge(original, overrides):
    if not isinstance(original, dict) or not isinstance(overrides, dict):
        raise TypeError('expected dictionaries')
    result = deepcopy(original)
    for key, value in overrides.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = merge(result[key], value)
        else:
            result[key] = deepcopy(value)
    return result

if __name__ == '__main__':
    defaults = {'ui':{'theme':'dark','lang':'en'}}
    updated = merge(defaults, {'ui':{'lang':'el'}})
    assert updated['ui'] == {'theme':'dark','lang':'el'}
    assert defaults['ui']['lang'] == 'en'
    print(updated)
