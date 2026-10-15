export const mockPayment = (valor) => {
  console.log('Pagamento mock de R$', valor, 'aprovado');
  return { status: 'approved', id: 'MOCK-' + Date.now() };
};
