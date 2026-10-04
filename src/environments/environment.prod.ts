export const environment = {
  production: true,
  apiUrl: '/api',
  /** Em produção o nginx encaminha /midia para o backend. */
  mediaUrl: '',
  /** Em produção a tela de login abre com os campos vazios. */
  loginPrefill: null as { email: string; password: string } | null,
};
