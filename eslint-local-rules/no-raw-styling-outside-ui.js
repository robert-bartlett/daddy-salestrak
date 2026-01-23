module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow className/style usage outside UI components',
      recommended: false,
    },
    schema: [],
    messages: {
      noRawStyling:
        'Use semantic UI/layout components instead of raw className/style props outside components/ui.',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        const name = node.name && node.name.name;
        if (name === 'className' || name === 'style') {
          context.report({ node, messageId: 'noRawStyling' });
        }
      },
    };
  },
};
