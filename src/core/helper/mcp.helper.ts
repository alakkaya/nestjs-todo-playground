export const formatMcpToolResponse = (
  message: string,
  data: Record<string, any>,
) => {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          success: true,
          message,
          data,
        }),
      },
    ],
  };
};
