"use client";
import { useState, useEffect } from 'react';

const Game = () => {
  const [player, setPlayer] = useState({ x: 100, y: 100, size: 20 });
  const [points, setPoints] = useState<Array<{ x: number; y: number }>>([]);
  const [enemies, setEnemies] = useState<Array<{ x: number; y: number }>>([]);
  const [walls, setWalls] = useState<Array<{ x: number; y: number; width: number; height: number }>>([]);
  const [score, setScore] = useState(0);
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const newPoints = Array.from({ length: 10 }, () => ({
      x: Math.random() * (window.innerWidth - 20),
      y: Math.random() * (window.innerHeight - 20),
    }));
    setPoints(newPoints);

    const newWalls = Array.from({ length: 4 }, () => ({
      x: Math.random() * (window.innerWidth - 60),
      y: Math.random() * (window.innerHeight - 60),
      width: Math.random() * 60 + 40,
      height: Math.random() * 60 + 40,
    }));
    setWalls(newWalls);

    const newEnemies = Array.from({ length: 5 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
    }));
    setEnemies(newEnemies);
  }, []);

  useEffect(() => {
    const movementHandler = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
          setDirection({ x: 0, y: -5 });
          break;
        case 'ArrowDown':
          setDirection({ x: 0, y: 5 });
          break;
        case 'ArrowLeft':
          setDirection({ x: -5, y: 0 });
          break;
        case 'ArrowRight':
          setDirection({ x: 5, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', movementHandler);
    return () => window.removeEventListener('keydown', movementHandler);
  }, []);

  // Snake game shit movement fuck this shit
  useEffect(() => {
    const movePlayer = () => {
      setPlayer(prev => ({
        x: Math.min(Math.max(prev.x + direction.x, 0), window.innerWidth - prev.size),
        y: Math.min(Math.max(prev.y + direction.y, 0), window.innerHeight - prev.size),
        size: prev.size
      }));
    };

    const interval = setInterval(movePlayer, 50);
    return () => clearInterval(interval);
  }, [direction]);

  // not working fix needed
  useEffect(() => {
    const checkCollisions = () => {
      setPoints(prevPoints => prevPoints.filter(point => {
        const distance = Math.sqrt(
          Math.pow(point.x - player.x, 2) + Math.pow(point.y - player.y, 2)
        );
        if (distance < player.size / 2 + 5) {
          setScore(score + 1);
          setPlayer(prev => ({ ...prev, size: prev.size + 5 }));
          setEnemies(prevEnemies => [
            ...prevEnemies,
            { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }
          ]);

          return false;
        }
        return true;
      }));
    };

    checkCollisions();
  }, [player, score]);

  useEffect(() => {
    const moveEnemies = () => {
      setEnemies(prevEnemies => prevEnemies.map(enemy => ({
        ...enemy,
        x: enemy.x + Math.cos(Math.atan2(player.y - enemy.y, player.x - enemy.x)) * 1,
        y: enemy.y + Math.sin(Math.atan2(player.y - enemy.y, player.x - enemy.x)) * 1,
      })));
      setTimeout(moveEnemies, 100);
    };
    moveEnemies();
  }, [player, enemies]);

  useEffect(() => {
    const checkEnemyCollisions = () => {
      setEnemies(prevEnemies => prevEnemies.filter(enemy => {
        const distance = Math.sqrt(
          Math.pow(enemy.x - player.x, 2) + Math.pow(enemy.y - player.y, 2)
        );
        if (distance < player.size / 2 + 10) {
          setScore(prevScore => Math.max(prevScore - 3, 0));
          setPlayer(prev => ({ ...prev, size: Math.max(prev.size - 5, 20) }));
          return false
        }
        return true;
      }));
    };

    // no need interval for this i guess but idk
    const interval = setInterval(checkEnemyCollisions, 50);
    return () => clearInterval(interval);
  }, [player]);

  const checkWallCollisions = () => {
    const playerCollision = walls.some(wall =>
      player.x < wall.x + wall.width &&
      player.x + player.size > wall.x &&
      player.y < wall.y + wall.height &&
      player.y + player.size > wall.y
    );

    if (playerCollision) {
      setPlayer({ x: 100, y: 100, size: 20 });
      setScore(0);
    }

    const newEnemies = enemies.filter(enemy => {
      return !walls.some(wall =>
        enemy.x < wall.x + wall.width &&
        enemy.x + 20 > wall.x &&
        enemy.y < wall.y + wall.height &&
        enemy.y + 20 > wall.y
      );
    });

    setEnemies(newEnemies);
  };

  useEffect(() => {
    const interval = setInterval(checkWallCollisions, 50);
    return () => clearInterval(interval);
  }, [player, enemies]);


  // spent 1 hour on this bs going to make triangle point to player idk why am i doing this
  return (
    <div>
      <div style={{
        position: 'absolute',
        left: player.x,
        top: player.y,
        width: player.size,
        height: player.size,
        backgroundColor: 'blue',
      }} />

      {points.map((point, index) => (
        <div key={index} style={{
          position: 'absolute',
          left: point.x,
          top: point.y,
          width: '10px',
          height: '10px',
          backgroundColor: 'green',
          borderRadius: '50%',
        }} />
      ))}

      {enemies.map((enemy, index) => (
        <div key={index} style={{
          position: 'absolute',
          left: enemy.x,
          top: enemy.y,
          width: '20px',
          height: '20px',
          backgroundColor: 'red',
          clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)',
        }} />
      ))}

      {walls.map((wall, index) => (
        <div key={index} style={{
          position: 'absolute',
          left: wall.x,
          top: wall.y,
          width: wall.width,
          height: wall.height,
          backgroundColor: 'grey',
          opacity: 0.7
        }} />
      ))}

      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        color: 'white',
        fontSize: '24px',
      }}>
        Score: {score}
      </div>
    </div>
  );
};

export default Game;