import re

open_curly_brace = '{'
close_curly_brace = '}'

def border_class(variable_name):
    return f'''.{variable_name}-border {open_curly_brace}
    border: 1px solid var(--{variable_name}) !important;
{close_curly_brace}'''

def background_class(variable_name):
    return f'''.{variable_name}-bg {open_curly_brace}
    background-color: var(--{variable_name}) !important;
{close_curly_brace}'''

def color_class(variable_name):
    return f'''.{variable_name}-text {open_curly_brace}
    color: var(--{variable_name}) !important;
{close_curly_brace}'''

variables = []
variable_reg_exp = re.compile(r'--.*:')
with open('./public/themes/light.css', 'r') as file:
    for string in file:
        variable = re.search(variable_reg_exp, string)
        if variable:
            variables.append(variable.group()[2:-1])

classes = []
for variable in variables:
    for class_generator in border_class, background_class, color_class:
        classes.append(class_generator(variable))

string_classes = '\n'.join(classes)

with open('./public/themes/VariableClasses.css', 'w') as file:
    file.write(string_classes)
