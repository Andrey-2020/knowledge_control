from typing import (
    Dict,
    List,
    Optional,
    Union,
    Iterator,
    Tuple,
    Callable,
    TextIO,
)
import re


class Color:
    def __init__(self, r: int, g: int, b: int, a: Optional[float] = None):
        self.r = r
        self.g = g
        self.b = b
        self.a = a
        self.type = 'rgb' if a is None else 'rgba'

    def __str__(self):
        a = "" if self.a is None else f", {self.a}"
        return f'{self.type}({self.r}, {self.g}, {self.b}{a})'

    def __repr__(self):
        return f'Color({self.r}, {self.g}, {self.b}, {self.a})'


COLOR_REGEXP = r'rgba?\((?P<r>\d{1,3}), (?P<g>\d{1,3}), (?P<b>\d{1,3})(, (?P<a>\d.\d+))?\)'

FileSkelet = List[Union[str, None]]


def get_file_skelet(file: TextIO) -> FileSkelet:
    file_skelet: FileSkelet = []
    colors: Dict[str, Color] = {}

    for string in file:
        string = string[:-1]
        variable_name = re.search(r'(?P<variable>--.*):', string)
        if variable_name:
            value = re.match(
                COLOR_REGEXP,
                string[variable_name.end() + 1:],
            )
            colors[variable_name.group('variable')] = Color(
                int(value.group('r')),
                int(value.group('g')),
                int(value.group('b')),
                (
                    value.group('a')
                    if value.group('a') is None
                    else float(value.group('a'))
                ),
            )
            file_skelet.append(None)
        else:
            file_skelet.append(string)

    return file_skelet, colors


def generate_theme(
    colors: Dict[str, Color],
    color_changer: Callable[[Color], Color],
    file_skelet: List[Union[str, None]],
    full_filename: str,
):
    with open(full_filename, 'w') as file:
        color_iter: Iterator[Tuple[str, Color]] = iter(colors.items())
        for string in file_skelet:
            if string is None:
                variable, color = next(color_iter)
                result_string = f'    {variable}: {color_changer(color)};'
            else:
                result_string = string
            print(result_string, file=file)


def reverse_color_part(part: int) -> int:
    difference = abs(128 - part)
    return 127 - difference * (1 if part > 127 else -1)


def reverse_color(color: Color) -> Color:
    return Color(
        reverse_color_part(color.r),
        reverse_color_part(color.g),
        reverse_color_part(color.b),
        color.a,
    )


if __name__ == '__main__':
    theme_name = 'light'

    file_skelet: List[Union[str, None]] = []
    colors: Dict[str, Color] = {}
    with open(f'./public/themes/{theme_name}.css', 'r') as file:
        file_skelet, colors = get_file_skelet(file)

    # Здесь генерация нужных цветов
    generate_theme(
        colors,
        reverse_color,
        file_skelet,
        f'./public/themes/{theme_name}-reversed.css',
    )
