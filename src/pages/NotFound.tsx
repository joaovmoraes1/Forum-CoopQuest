import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAccessibility } from "@/components/Layout";

const NotFound = () => {
  const location = useLocation();
  const { fontSize } = useAccessibility();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4"
      style={{ fontSize: `${fontSize}px` }}
    >
      <Card
        className="max-w-md w-full bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl shadow-2xl border border-gray-600/50 transform transition-all hover:shadow-3xl duration-500"
      >
        <CardHeader className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 rounded-t-2xl">
          <CardTitle className="text-4xl font-extrabold text-white text-center">
            404 - Página Não Encontrada
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8 text-center space-y-6">
          <p className="text-gray-200 text-lg">
            Oops! A página que você está procurando não existe.
          </p>
          <Button
            onClick={() => window.location.href = "/"}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all hover:scale-105 duration-300"
          >
            Voltar para o Início
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;