# App de Produtos (React Native + Expo + Neon)

Aplicativo completo em React Native com Expo conectado a um banco de dados PostgreSQL na nuvem (**Neon**), permitindo cadastrar, listar e excluir produtos em tempo real.

---

### Tabela no Neon
Conforme a especificação, a tabela utilizada no Neon é:

```sql
CREATE TABLE produtos (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  preco NUMERIC(10,2) NOT NULL
);
```

---

### Funcionalidades
1. **Formulário de Cadastro:**
   * Campo **Nome** (texto obrigatório).
   * Campo **Preço** (numérico, suportando ponto ou vírgula).
   * Botão **Salvar** que persiste o registro diretamente no PostgreSQL do Neon.
2. **Listagem com FlatList:**
   * Lista responsiva com o nome e o preço formatado em moeda brasileira (`R$ 0,00`).
   * Recurso de **Pull-to-refresh** (puxar para baixo para recarregar).
3. **Exclusão de Produtos:**
   * Botão **Excluir** individual em cada card com confirmação antes da remoção e exclusão atômica no banco com atualização da lista.

---

### Estrutura do Projeto
```
app-produtos/
├── assets/                  # Ícones e splash screen
├── src/
│   └── db.js               # Conexão e queries SQL via @neondatabase/serverless
├── .env                     # Variável EXPO_PUBLIC_NEON_DATABASE_URL
├── .env.example
├── App.js                   # Interface do app, FlatList e validações
├── package.json
└── README.md
```

---

### Como Executar

1. Instale as dependências:
```bash
npm install
```

2. Certifique-se de que o arquivo `.env` possui a string de conexão do Neon:
```env
EXPO_PUBLIC_NEON_DATABASE_URL=postgresql://neondb_owner:npg_U4dYcOebtZX2@ep-dry-water-bdgd9qah.c-8.us-east-2.aws.neon.tech/neondb?sslmode=require
```

3. Inicie o servidor Expo:
```bash
npx expo start
```
* Pressione `w` ou abra `http://localhost:8081` para testar no navegador.
* Ou leia o QR Code com o aplicativo **Expo Go** no celular.
