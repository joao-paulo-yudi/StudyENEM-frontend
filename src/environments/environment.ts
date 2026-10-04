export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  /** Origem das imagens das questões, servidas pelo backend em /midia. */
  mediaUrl: 'http://localhost:8080',
  /** Conta de demonstração preenchida na tela de login, só para agilizar o desenvolvimento. */
  loginPrefill: { email: 'joao@studyenem.com', password: '1234' } as { email: string; password: string } | null,
};
