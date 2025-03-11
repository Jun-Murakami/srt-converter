import { useState, useRef } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  Grid2,
} from '@mui/material';

function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [duration, setDuration] = useState('5:30');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileOpen = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const text = await file.text();
      setInputText(text);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    // テキストファイルのドロップ処理
    if (e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const text = await file.text();
      setInputText(text);
      return;
    }

    // プレーンテキストのドロップ処理
    const text = e.dataTransfer.getData('text');
    if (text) {
      setInputText(text);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  };

  const handleConvert = () => {
    // 空行を除去して行を配列に分割
    const lines = inputText.split('\n').filter((line) => line.trim() !== '');

    // 動画時間を秒に変換
    const [minutes, seconds] = duration.split(':').map(Number);
    const totalSeconds = minutes * 60 + seconds;

    // 各行の表示時間を計算
    const timePerLine = totalSeconds / lines.length;

    // SRT形式に変換
    const srtLines = lines.map((line, index) => {
      const startTime = timePerLine * index;
      const endTime = timePerLine * (index + 1);

      return `${index + 1}\n${formatTime(startTime)} --> ${formatTime(endTime)}\n${line}\n`;
    });

    setOutputText(srtLines.join('\n'));
  };

  const handleDownload = () => {
    const blob = new Blob([outputText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'subtitle.srt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" align="center" gutterBottom>
        SRTコンバーター
      </Typography>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept=".txt"
      />

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Paper
          sx={{
            width: '50%',
            p: 2,
            border: isDragging ? '2px dashed #1976d2' : '2px solid transparent',
            transition: 'border 0.2s ease',
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <Typography variant="h5" gutterBottom>
            テキスト入力
          </Typography>
          <TextField
            multiline
            fullWidth
            rows={20}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
          />
        </Paper>

        <Paper sx={{ width: '50%', p: 2 }}>
          <Typography variant="h5" gutterBottom>
            テキスト出力
          </Typography>
          <TextField multiline fullWidth rows={20} value={outputText} />
        </Paper>
      </Box>

      <Grid2 container spacing={2}>
        <Grid2 size={4}>
          <Button variant="contained" onClick={handleFileOpen}>
            開く
          </Button>
        </Grid2>

        <Grid2 size={4}>
          <Stack direction="column" spacing={2} alignItems="center">
            <TextField
              label="動画(楽曲)の再生時間"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              sx={{ width: 200 }}
            />
            <Button
              variant="contained"
              onClick={handleConvert}
              sx={{ width: 200 }}
            >
              変換
            </Button>
          </Stack>
        </Grid2>

        <Grid2 size={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Box>
            <Button
              variant="contained"
              onClick={handleDownload}
              disabled={!outputText}
            >
              ダウンロード
            </Button>
          </Box>
        </Grid2>
      </Grid2>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, gap: 5 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          １．テキストファイルをドラッグ＆ドロップ、または直接入力
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          ２．動画(楽曲)の再生時間を入力
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          ３．変換ボタンを押す
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, gap: 5 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom>
          ※テキスト情報がサーバに送信されることはありません。ローカルでのみ処理されます
        </Typography>
      </Box>
    </Container>
  );
}

export default App;
