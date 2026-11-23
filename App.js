// App.js
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import {
  inicializarBanco,
  listarProdutos,
  salvarProduto,
  excluirProduto,
} from './src/db';

export default function App() {
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  // Carrega os produtos e garante a existência da tabela
  async function carregarDados() {
    try {
      await inicializarBanco();
      const dados = await listarProdutos();
      setProdutos(dados);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      mostrarAlerta('Erro', 'Não foi possível carregar os produtos do banco.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function mostrarAlerta(titulo, mensagem) {
    if (Platform.OS === 'web') {
      window.alert(`${titulo}: ${mensagem}`);
    } else {
      Alert.alert(titulo, mensagem);
    }
  }

  // Grava o produto no banco Neon
  async function handleSalvar() {
    Keyboard.dismiss();

    const nomeFormatado = nome.trim();
    const precoFormatado = preco.replace(',', '.').trim();

    if (!nomeFormatado) {
      mostrarAlerta('Atenção', 'Informe o nome do produto.');
      return;
    }

    const valorNumerico = parseFloat(precoFormatado);
    if (isNaN(valorNumerico) || valorNumerico <= 0) {
      mostrarAlerta('Atenção', 'Informe um preço válido maior que zero.');
      return;
    }

    setSalvando(true);
    try {
      const novoProduto = await salvarProduto(nomeFormatado, valorNumerico);
      // Atualiza a lista na interface imediatamente
      setProdutos((atuais) => [novoProduto, ...atuais]);
      setNome('');
      setPreco('');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      mostrarAlerta('Erro', 'Falha ao salvar o produto no banco Neon.');
    } finally {
      setSalvando(false);
    }
  }

  // Apaga o produto do banco e atualiza a lista
  async function handleExcluir(id, nomeProduto) {
    const executarExclusao = async () => {
      setExcluindoId(id);
      try {
        await excluirProduto(id);
        // Remove da lista em memória
        setProdutos((atuais) => atuais.filter((item) => item.id !== id));
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        mostrarAlerta('Erro', 'Falha ao excluir o produto do banco.');
      } finally {
        setExcluindoId(null);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`Deseja realmente excluir "${nomeProduto}"?`)) {
        await executarExclusao();
      }
    } else {
      Alert.alert(
        'Confirmar Exclusão',
        `Deseja realmente excluir "${nomeProduto}"?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Excluir', style: 'destructive', onPress: executarExclusao },
        ]
      );
    }
  }

  function formatarPreco(valor) {
    const num = Number(valor);
    if (isNaN(num)) return 'R$ 0,00';
    return `R$ ${num.toFixed(2).replace('.', ',')}`;
  }

  function renderItem({ item }) {
    const estaExcluindo = excluindoId === item.id;
    return (
      <View style={styles.cardItem}>
        <View style={styles.infoContainer}>
          <Text style={styles.nomeItem}>{item.nome}</Text>
          <Text style={styles.precoItem}>{formatarPreco(item.preco)}</Text>
        </View>

        <TouchableOpacity
          style={[styles.botaoExcluir, estaExcluindo && styles.botaoDesativado]}
          onPress={() => handleExcluir(item.id, item.nome)}
          disabled={estaExcluindo}
          activeOpacity={0.7}
        >
          {estaExcluindo ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.textoBotaoExcluir}>Excluir</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.titulo}>Cadastro de Produtos</Text>
        </View>

        {/* Formulário */}
        <View style={styles.cardFormulario}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Teclado Mecânico"
            placeholderTextColor="#9CA3AF"
            value={nome}
            onChangeText={setNome}
          />

          <Text style={styles.label}>Preço</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: 249.90"
            placeholderTextColor="#9CA3AF"
            value={preco}
            onChangeText={setPreco}
            keyboardType="decimal-pad"
          />

          <TouchableOpacity
            style={[styles.botaoSalvar, salvando && styles.botaoDesativado]}
            onPress={handleSalvar}
            disabled={salvando}
            activeOpacity={0.8}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.textoBotaoSalvar}>Salvar</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Título da Lista */}
        <View style={styles.listaHeader}>
          <Text style={styles.listaTitulo}>Produtos Cadastrados</Text>
          <Text style={styles.badgeCount}>{produtos.length}</Text>
        </View>

        {/* Lista com FlatList */}
        {carregando ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.textoCarregando}>Carregando banco Neon...</Text>
          </View>
        ) : (
          <FlatList
            data={produtos}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.listaConteudo}
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregarDados();
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitulo}>Nenhum produto cadastrado</Text>
                <Text style={styles.emptySubtitulo}>
                  Preencha os campos acima e clique em "Salvar" para gravar no Neon.
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 40 : 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  titulo: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitulo: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '600',
    marginTop: 4,
  },
  cardFormulario: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 14,
  },
  botaoSalvar: {
    backgroundColor: '#4F46E5',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  textoBotaoSalvar: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  botaoDesativado: {
    opacity: 0.6,
  },
  listaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listaTitulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  badgeCount: {
    backgroundColor: '#EEF2FF',
    color: '#4F46E5',
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  listaConteudo: {
    paddingBottom: 40,
  },
  cardItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  nomeItem: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  precoItem: {
    fontSize: 15,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
  },
  botaoExcluir: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 74,
  },
  textoBotaoExcluir: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50,
  },
  textoCarregando: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyTitulo: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtitulo: {
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 6,
  },
});
