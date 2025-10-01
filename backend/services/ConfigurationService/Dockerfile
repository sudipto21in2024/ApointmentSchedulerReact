FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/services/ConfigurationService/ConfigurationService.csproj", "./"]
RUN dotnet restore "./ConfigurationService.csproj"
COPY . .
WORKDIR "/src/backend/services/ConfigurationService"
RUN dotnet build "ConfigurationService.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "ConfigurationService.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "ConfigurationService.dll"]