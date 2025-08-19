import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingDown, TrendingUp, DollarSign, Star, Truck, Clock, Shield, Zap } from 'lucide-react';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from 'sonner';

interface PriceComparison {
  item_name: string;
  sku: string;
  suppliers: SupplierPrice[];
  bestDeal: SupplierPrice;
  avgPrice: number;
  priceRange: { min: number; max: number };
  marketTrend: 'rising' | 'falling' | 'stable';
  recommendations: string[];
}

interface SupplierPrice {
  supplier_name: string;
  price: number;
  quantity: number;
  discount: number;
  shipping_cost: number;
  total_cost: number;
  delivery_time: string;
  quality_rating: number;
  reliability_score: number;
  special_offers: string[];
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
}

export function AIPriceComparator() {
  const [comparisons, setComparisons] = useState<PriceComparison[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'best_deal' | 'price' | 'quality' | 'delivery'>('best_deal');
  const { currentTenant } = useTenant();

  useEffect(() => {
    if (currentTenant) {
      fetchPriceComparisons();
    }
  }, [currentTenant, searchTerm]);

  const fetchPriceComparisons = async () => {
    try {
      setLoading(true);
      
      // Simulate AI-powered price comparison data
      const mockComparisons: PriceComparison[] = [
        {
          item_name: 'Composite Resin A2',
          sku: 'CR-A2-001',
          suppliers: [
            {
              supplier_name: 'DentSupply Pro',
              price: 45.99,
              quantity: 1,
              discount: 15,
              shipping_cost: 8.50,
              total_cost: 47.59,
              delivery_time: '2-3 days',
              quality_rating: 4.8,
              reliability_score: 95,
              special_offers: ['Bulk discount 20%', 'Free shipping on $100+'],
              stock_status: 'in_stock'
            },
            {
              supplier_name: 'MedDental Direct',
              price: 52.00,
              quantity: 1,
              discount: 5,
              shipping_cost: 12.00,
              total_cost: 61.40,
              delivery_time: '1-2 days',
              quality_rating: 4.9,
              reliability_score: 88,
              special_offers: ['Express delivery available'],
              stock_status: 'in_stock'
            },
            {
              supplier_name: 'Dental Warehouse',
              price: 38.75,
              quantity: 1,
              discount: 25,
              shipping_cost: 15.00,
              total_cost: 44.06,
              delivery_time: '5-7 days',
              quality_rating: 4.3,
              reliability_score: 82,
              special_offers: ['25% off first order'],
              stock_status: 'low_stock'
            }
          ],
          bestDeal: {
            supplier_name: 'Dental Warehouse',
            price: 38.75,
            quantity: 1,
            discount: 25,
            shipping_cost: 15.00,
            total_cost: 44.06,
            delivery_time: '5-7 days',
            quality_rating: 4.3,
            reliability_score: 82,
            special_offers: ['25% off first order'],
            stock_status: 'low_stock'
          },
          avgPrice: 45.58,
          priceRange: { min: 38.75, max: 52.00 },
          marketTrend: 'falling',
          recommendations: [
            'Order from Dental Warehouse for best price but consider stock risk',
            'DentSupply Pro offers good balance of price and reliability',
            'Market prices trending down - consider waiting for better deals'
          ]
        },
        {
          item_name: 'Dental Gloves (Nitrile, Medium)',
          sku: 'GL-NIT-M-100',
          suppliers: [
            {
              supplier_name: 'GloveTech Solutions',
              price: 28.99,
              quantity: 100,
              discount: 10,
              shipping_cost: 5.00,
              total_cost: 31.09,
              delivery_time: '1 day',
              quality_rating: 4.7,
              reliability_score: 93,
              special_offers: ['Subscribe & Save 15%'],
              stock_status: 'in_stock'
            },
            {
              supplier_name: 'SafeGuard Medical',
              price: 32.50,
              quantity: 100,
              discount: 0,
              shipping_cost: 0,
              total_cost: 32.50,
              delivery_time: '2-3 days',
              quality_rating: 4.9,
              reliability_score: 97,
              special_offers: ['Free shipping'],
              stock_status: 'in_stock'
            }
          ],
          bestDeal: {
            supplier_name: 'GloveTech Solutions',
            price: 28.99,
            quantity: 100,
            discount: 10,
            shipping_cost: 5.00,
            total_cost: 31.09,
            delivery_time: '1 day',
            quality_rating: 4.7,
            reliability_score: 93,
            special_offers: ['Subscribe & Save 15%'],
            stock_status: 'in_stock'
          },
          avgPrice: 30.75,
          priceRange: { min: 28.99, max: 32.50 },
          marketTrend: 'stable',
          recommendations: [
            'GloveTech offers best value with fast delivery',
            'Consider subscription for additional 15% savings',
            'Stable market pricing - good time to establish long-term contracts'
          ]
        }
      ];

      setComparisons(mockComparisons);
    } catch (error) {
      console.error('Error fetching price comparisons:', error);
      toast.error('Failed to load price comparisons');
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'rising': return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'falling': return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <DollarSign className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'low_stock': return 'text-amber-600 bg-amber-50 dark:bg-amber-900/20';
      case 'out_of_stock': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const calculateSavings = (currentPrice: number, bestPrice: number) => {
    const savings = currentPrice - bestPrice;
    const percentage = (savings / currentPrice) * 100;
    return { amount: savings, percentage };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-primary rounded-lg">
            <DollarSign className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">AI Price Comparator</h2>
            <p className="text-muted-foreground">Find the best deals with intelligent price analysis</p>
          </div>
        </div>
        <Button onClick={fetchPriceComparisons} className="bg-gradient-primary text-primary-foreground shadow-elegant">
          <Zap className="w-4 h-4 mr-2" />
          Refresh Prices
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-primary/10 bg-card/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search items to compare prices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="best_deal">Best Deal</SelectItem>
                <SelectItem value="price">Lowest Price</SelectItem>
                <SelectItem value="quality">Highest Quality</SelectItem>
                <SelectItem value="delivery">Fastest Delivery</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Price Comparisons */}
      <div className="space-y-6">
        {loading ? (
          [...Array(2)].map((_, i) => (
            <Card key={i} className="animate-pulse border-primary/10">
              <CardContent className="p-6">
                <div className="h-40 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          comparisons.map((comparison, index) => (
            <Card key={index} className="border-primary/10 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {comparison.item_name}
                      {getTrendIcon(comparison.marketTrend)}
                    </CardTitle>
                    <CardDescription>SKU: {comparison.sku}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Best Deal</div>
                    <div className="text-2xl font-bold text-green-600">
                      ${comparison.bestDeal.total_cost.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg: ${comparison.avgPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Market Insights */}
                <div className="bg-accent/10 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    AI Market Insights
                  </h4>
                  <div className="space-y-1">
                    {comparison.recommendations.map((rec, i) => (
                      <p key={i} className="text-sm text-muted-foreground">• {rec}</p>
                    ))}
                  </div>
                </div>

                {/* Supplier Comparison */}
                <div className="grid gap-4">
                  <h4 className="font-semibold">Supplier Comparison</h4>
                  {comparison.suppliers.map((supplier, i) => {
                    const savings = calculateSavings(comparison.avgPrice, supplier.total_cost);
                    const isBestDeal = supplier.supplier_name === comparison.bestDeal.supplier_name;
                    
                    return (
                      <div 
                        key={i} 
                        className={`p-4 rounded-lg border transition-all duration-300 ${
                          isBestDeal 
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500/20' 
                            : 'border-border hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-semibold">{supplier.supplier_name}</h5>
                              {isBestDeal && (
                                <Badge className="bg-green-600 text-white">
                                  <Star className="w-3 h-3 mr-1" />
                                  Best Deal
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <Badge variant="outline" className={getStockStatusColor(supplier.stock_status)}>
                                {supplier.stock_status.replace('_', ' ')}
                              </Badge>
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-amber-500" />
                                <span className="text-xs">{supplier.quality_rating}/5</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3 text-blue-500" />
                                <span className="text-xs">{supplier.reliability_score}%</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">${supplier.total_cost.toFixed(2)}</div>
                            {savings.amount !== 0 && (
                              <div className={`text-sm ${savings.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {savings.amount > 0 ? 'Save' : 'Extra'} ${Math.abs(savings.amount).toFixed(2)}
                                ({Math.abs(savings.percentage).toFixed(1)}%)
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Base Price:</span>
                            <div className="font-medium">${supplier.price.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Discount:</span>
                            <div className="font-medium text-green-600">{supplier.discount}%</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Shipping:</span>
                            <div className="font-medium">${supplier.shipping_cost.toFixed(2)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Truck className="w-3 h-3" />
                              Delivery:
                            </span>
                            <div className="font-medium">{supplier.delivery_time}</div>
                          </div>
                        </div>

                        {supplier.special_offers.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-dashed">
                            <div className="text-xs text-muted-foreground mb-1">Special Offers:</div>
                            <div className="flex flex-wrap gap-1">
                              {supplier.special_offers.map((offer, j) => (
                                <Badge key={j} variant="secondary" className="text-xs">
                                  {offer}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-2 mt-4">
                          <Button size="sm" className="flex-1">
                            Order Now
                          </Button>
                          <Button size="sm" variant="outline">
                            Add to Cart
                          </Button>
                          <Button size="sm" variant="outline">
                            Get Quote
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}