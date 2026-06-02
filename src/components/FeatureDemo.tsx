
import React from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams, Link } from "react-router-dom";
import { featureContentMap } from "./features/FeatureContentMap";
import NotFoundFeature from "./features/NotFoundFeature";

const FeatureDemo = () => {
 const { featureId, title } = useParams();
 const navigate = useNavigate();
 const key = featureId ?? title;
 const decodedFeatureId = key ? decodeURIComponent(key) : null;

 const feature = decodedFeatureId ? featureContentMap[decodedFeatureId] : null;

 if (!feature) {
 return <NotFoundFeature />;
 }

 const featureKeys = Object.keys(featureContentMap);

 return (
 <div className="container mx-auto px-4 max-w-6xl">
 <Button
 variant="ghost"
 onClick={() => navigate('/')}
 className="mb-4 -ml-2 text-foreground hover:text-foreground"
 >
 <ArrowLeft className="mr-2 h-4 w-4" />
 Back to home
 </Button>

 <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
 <div>
 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 text-primary text-xs font-medium mb-3">
 <Sparkles className="h-3.5 w-3.5" />
 Interactive demo
 </div>
 <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{feature.title}</h1>
 <p className="text-lg text-foreground max-w-2xl">{feature.description}</p>
 </div>
 <Button
 asChild
 className="bg-primary hover:bg-primary/90 text-white shrink-0"
 >
 <Link to="/auth?signup=true">Start free trial</Link>
 </Button>
 </div>

 <div className="bg-card rounded-2xl border border-border shadow-sm p-6 md:p-8">
 {feature.content}
 </div>

 <div className="mt-10">
 <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
 Explore other features
 </h3>
 <div className="flex flex-wrap gap-2">
 {featureKeys
 .filter((k) => k !== decodedFeatureId)
 .map((k) => (
 <Link
 key={k}
 to={`/feature/${encodeURIComponent(k)}`}
 className="px-4 py-2 rounded-full border border-border bg-card text-sm text-foreground hover:border-primary hover:text-primary transition-colors"
 >
 {k}
 </Link>
 ))}
 </div>
 </div>
 </div>
 );
};

export default FeatureDemo;
