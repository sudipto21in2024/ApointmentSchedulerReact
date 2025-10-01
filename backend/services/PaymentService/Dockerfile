FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/services/PaymentService/PaymentService.csproj", "./"]
RUN dotnet restore "./PaymentService.csproj"
COPY . .
WORKDIR "/src/backend/services/PaymentService"
RUN dotnet build "PaymentService.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "PaymentService.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "PaymentService.dll"]