type Handler = (x: unknown, indentLevel?: string) => string;

export const jsonToMarkdown = (data: unknown, columns?: string[]): string => {
  const indentLevel = '  ';

  const handlers: { [key: string]: Handler } = {
    undefined: () => 'null',
    object: (x, indent = '') => {
      if (x === null) return 'null';
      if (Array.isArray(x)) {
        if (x.length === 0) return '[]';
        return x
          .map((item) => `\n${indent}- ${processValue(item, indent)}`)
          .join('');
      }
      let entries = Object.entries(x as Record<string, unknown>);

      // Filter based on the selected columns (if provided)
      if (columns && columns.length > 0) {
        entries = entries.filter(([key]) => columns.includes(key));
      }

      if (entries.length === 0) return '{}';

      return entries
        .map(
          ([key, value]) =>
            `\n${indent}**${key}:** ${processValue(value, indent + '  ')}\n`
        )
        .join('');
    },
    number: (x) => (x as number).toString(),
    boolean: (x) => (x ? 'true' : 'false'),
    string: (x) => `"${x}"`,
    function: () => '[Function]',
  };

  const processValue = (value: unknown, indent: string): string => {
    const handler = handlers[typeof value] || handlers.object;
    return handler(value, indent);
  };

  return processValue(data, indentLevel);
};
