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

      if (columns?.length) {
        entries = entries.filter(([key]) => columns.includes(key));
      }

      if (!entries.length) return '{}';

      let result = ''; // Accumulate the result

      for (const [key, value] of entries) {
        // Iterate to avoid extra newline at the beginning
        const processedValue = processValue(value, indent);
        if (result) {
          // Add newline only if there's previous content
          result += '\n';
        }
        result += `${indent}**${key}:** `; // Key and colon, space after
        if (processedValue.includes('\n')) {
          result += `\n${processedValue}`; // Multi-line: Add newline before value
        } else {
          result += processedValue; // Single-line: Value on the same line
        }
      }
      return result;
    },
    number: String,
    boolean: (x) => (x ? 'true' : 'false'),
    string: String,
    function: () => '[Function]',
  };

  const processValue = (value: unknown, indent: string): string => {
    return (handlers[typeof value] || handlers.object)(value, indent);
  };

  return processValue(data, indentLevel);
};
