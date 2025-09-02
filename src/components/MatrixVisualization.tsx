import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, Filter, TrendingUp, TrendingDown, Minus, Info, X, Calculator, Brain, Zap } from 'lucide-react';
import { ProcessingState } from '../types';

interface MatrixVisualizationProps {
  matrixData: Record<string, number>;
  processingState: ProcessingState;
}

const MatrixVisualization: React.FC<MatrixVisualizationProps> = ({ matrixData, processingState }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedDimension, setSelectedDimension] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<string | null>(null);

  // Mock dimension names mapping (in real app this would come from metadata)
  const dimensionNames: Record<string, string> = {
    '0071': 'Social Achievements',
    '0048': 'Leadership Ability',
    '0008': 'Dietary Habits',
    '0032': 'Emotional Stability',
    '0099': 'Learning Orientation',
    '0156': 'Creative Expression',
    'SP088': 'Social Responsibility',
    '0010': 'Physical Fitness',
    '0040': 'Social Relationships',
    '0081': 'Technology Adoption',
    '0067': 'Spiritual Awareness',
    '0203': 'Risk Taking'
  };
  const categories = {
    physical: { name: 'Physical', color: 'bg-red-500', attributes: ['0010', '0012', '0016', '0019', '0021', '0033', '0034', '0035'] },
    social: { name: 'Social', color: 'bg-green-500', attributes: ['0040', '0041', '0047', '004C', '004D', '0054', '0060', '006E', '0071', '0048'] },
    digital: { name: 'Digital', color: 'bg-blue-500', attributes: ['0081', '0088', '0093', '0094', '0096', '00B6', '00BC', '00BF'] },
    spiritual: { name: 'Spiritual', color: 'bg-purple-500', attributes: ['0067', '0069', '006C', '006D', '0070', '0099', '0156', 'SP088'] }
  };

  const getScoreColor = (score: number) => {
    if (score >= 200) return 'bg-green-400';
    if (score >= 150) return 'bg-yellow-400';
    if (score >= 100) return 'bg-orange-400';
    if (score >= 50) return 'bg-red-400';
    return 'bg-gray-400';
  };

  const getScoreIntensity = (score: number) => {
    return Math.max(0.1, score / 255);
  };

  const filteredData = useMemo(() => {
    if (selectedCategory === 'all') return matrixData;
    
    const categoryAttrs = categories[selectedCategory as keyof typeof categories]?.attributes || [];
    return Object.fromEntries(
      Object.entries(matrixData).filter(([attrId]) => 
        categoryAttrs.some(catAttr => attrId.includes(catAttr))
      )
    );
  }, [matrixData, selectedCategory]);

  const getChangeIcon = (attrId: string) => {
    // Mock change detection - in real app this would track previous values
    const score = matrixData[attrId] || 128;
    if (score > 150) return <TrendingUp className="w-3 h-3 text-green-400" />;
    if (score < 100) return <TrendingDown className="w-3 h-3 text-red-400" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getDimensionName = (attrId: string) => {
    return dimensionNames[attrId] || `Dimension ${attrId}`;
  };

  const getCalculationDetails = (attrId: string, score: number) => {
    // Mock calculation process details - in real app this would come from ULTU processor
    const baseScore = 128;
    const geminiRawScore = Math.round(score / 0.7); // Reverse engineer raw score
    const smoothingFactor = 0.3;
    const timeDecayFactor = 0.95;
    
    return {
      geminiRawScore,
      baseScore,
      smoothingFactor,
      timeDecayFactor,
      finalScore: score,
      formula: `新分數 = α × Gemini評分 + (1-α) × 舊分數`,
      calculation: `${score} = ${smoothingFactor} × ${geminiRawScore} + ${1-smoothingFactor} × ${baseScore}`,
      metaTags: ['學習', '成就感', '團隊合作'], // Mock meta tags
      matchingProcess: [
        { step: 'Meta-Tag提取', result: '學習, 成就感, 團隊合作', confidence: 0.92 },
        { step: '語意匹配', result: `與維度${attrId}相似度: 0.85`, confidence: 0.85 },
        { step: 'Gemini評分', result: `原始分數: ${geminiRawScore}`, confidence: 0.88 },
        { step: '分數平滑', result: `最終分數: ${score}`, confidence: 1.0 }
      ]
    };
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <Grid className="w-5 h-5 mr-2 text-primary" />
          Twin Matrix Visualization
        </h3>
        
        <div className="flex items-center space-x-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-secondary text-secondary-foreground px-3 py-1 rounded-md border border-border text-sm"
          >
            <option value="all">All Dimensions</option>
            {Object.entries(categories).map(([key, cat]) => (
              <option key={key} value={key}>{cat.name}</option>
            ))}
          </select>
          
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 bg-secondary hover:bg-secondary/80 rounded-md border border-border"
          >
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Algorithm Results Summary */}
      {Object.keys(matrixData).length > 0 && (
        <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <h4 className="text-sm font-semibold mb-2 flex items-center text-primary">
            <Info className="w-4 h-4 mr-2" />
            演算法計算結果 (Algorithm Results)
          </h4>
          <div className="text-xs text-muted-foreground">
            共更新 {Object.keys(matrixData).length} 個維度 | 
            最高分數: {Math.max(...Object.values(matrixData))} | 
            平均分數: {Math.round(Object.values(matrixData).reduce((a, b) => a + b, 0) / Object.keys(matrixData).length)}
          </div>
        </div>
      )}
      {/* Category Legend */}
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(categories).map(([key, cat]) => (
          <div key={key} className="flex items-center space-x-1">
            <div className={`w-3 h-3 rounded-full ${cat.color}`}></div>
            <span className="text-xs text-muted-foreground">{cat.name}</span>
          </div>
        ))}
      </div>

      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-4 gap-3">
          {Object.entries(filteredData).map(([attrId, score]) => {
            const category = Object.entries(categories).find(([_, cat]) => 
              cat.attributes.some(catAttr => attrId.includes(catAttr))
            );
            const categoryColor = category?.[1].color || 'bg-gray-500';
            const dimensionName = getDimensionName(attrId);
            
            return (
              <motion.div
                key={attrId}
                className={`matrix-cell rounded-lg border border-border/50 relative group cursor-pointer p-4 ${categoryColor}`}
                style={{ 
                  opacity: getScoreIntensity(score),
                }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                onClick={() => setShowDetailModal(attrId)}
                animate={processingState === 'processing' ? { 
                  scale: [1, 1.05, 1],
                  opacity: [getScoreIntensity(score), 0.8, getScoreIntensity(score)]
                } : {}}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <div className="text-lg font-bold text-white drop-shadow-sm mb-1">
                    {score}
                  </div>
                  <div className="text-xs text-white/90 font-medium mb-1">
                    {attrId}
                  </div>
                  <div className="text-xs text-white/80 leading-tight">
                    {dimensionName}
                  </div>
                </div>
                
                {/* Algorithm Result Badge */}
                <div className="absolute top-1 right-1">
                  <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {Object.entries(filteredData)
            .sort(([,a], [,b]) => b - a)
            .map(([attrId, score]) => {
              const category = Object.entries(categories).find(([_, cat]) => 
                cat.attributes.some(catAttr => attrId.includes(catAttr))
              );
              const dimensionName = getDimensionName(attrId);
              
              return (
                <motion.div
                  key={attrId}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg border border-border"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${category?.[1].color || 'bg-gray-500'}`}></div>
                    <div>
                      <div className="font-mono text-sm font-semibold">{attrId}</div>
                      <div className="text-xs text-muted-foreground">{dimensionName}</div>
                    </div>
                    {getChangeIcon(attrId)}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${getScoreColor(score)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(score / 255) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-bold">{score}</div>
                      <div className="text-xs text-muted-foreground">/255</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      )}

      {/* Detailed Dimension Modal */}
      <AnimatePresence>
        {showDetailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDetailModal(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {(() => {
                const score = matrixData[showDetailModal];
                const dimensionName = getDimensionName(showDetailModal);
                const details = getCalculationDetails(showDetailModal, score);
                
                return (
                  <>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold">{dimensionName}</h3>
                        <p className="text-muted-foreground font-mono">{showDetailModal}</p>
                      </div>
                      <button
                        onClick={() => setShowDetailModal(null)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Score Display */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-primary/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-primary">{score}</div>
                        <div className="text-sm text-muted-foreground">演算法分數</div>
                      </div>
                      <div className="bg-secondary p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold font-mono">0x{score.toString(16).toUpperCase().padStart(2, '0')}</div>
                        <div className="text-sm text-muted-foreground">HEX值</div>
                      </div>
                      <div className="bg-accent/10 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold">{Math.round((score/255)*100)}%</div>
                        <div className="text-sm text-muted-foreground">相對強度</div>
                      </div>
                    </div>

                    {/* Calculation Process */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-semibold flex items-center">
                        <Calculator className="w-5 h-5 mr-2 text-primary" />
                        演算法計算過程
                      </h4>
                      
                      {/* Processing Steps */}
                      <div className="space-y-3">
                        {details.matchingProcess.map((step, index) => (
                          <div key={index} className="flex items-center space-x-4 p-3 bg-secondary rounded-lg">
                            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{step.step}</div>
                              <div className="text-sm text-muted-foreground">{step.result}</div>
                            </div>
                            <div className="text-sm font-mono bg-primary/20 px-2 py-1 rounded">
                              {Math.round(step.confidence * 100)}%
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* ULTU Formula */}
                      <div className="bg-accent/10 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          ULTU 分數平滑公式
                        </h5>
                        <div className="font-mono text-sm bg-background p-3 rounded border">
                          {details.formula}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                          實際計算: {details.calculation}
                        </div>
                        <div className="mt-2 text-xs text-muted-foreground">
                          α (平滑係數) = {details.smoothingFactor} | 時間衰減 = {details.timeDecayFactor}
                        </div>
                      </div>

                      {/* Meta Tags Used */}
                      <div className="bg-secondary/50 p-4 rounded-lg">
                        <h5 className="font-semibold mb-2 flex items-center">
                          <Brain className="w-4 h-4 mr-2" />
                          相關 Meta-Tags
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {details.metaTags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Technical Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Gemini原始評分:</span>
                            <span className="font-mono font-bold">{details.geminiRawScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">前次分數:</span>
                            <span className="font-mono">{details.baseScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">平滑係數 (α):</span>
                            <span className="font-mono">{details.smoothingFactor}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">時間衰減:</span>
                            <span className="font-mono">{details.timeDecayFactor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">最終分數:</span>
                            <span className="font-mono font-bold text-primary">{details.finalScore}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">分數變化:</span>
                            <span className={`font-mono font-bold ${score > details.baseScore ? 'text-green-400' : score < details.baseScore ? 'text-red-400' : 'text-gray-400'}`}>
                              {score > details.baseScore ? '+' : ''}{score - details.baseScore}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {processingState === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"
              />
              <p className="text-sm text-muted-foreground">Updating Matrix...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MatrixVisualization;