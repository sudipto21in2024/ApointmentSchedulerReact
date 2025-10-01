FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/services/NotificationService/NotificationService.csproj", "./"]
RUN dotnet restore "./NotificationService.csproj"
COPY . .
WORKDIR "/src/backend/services/NotificationService"
RUN dotnet build "NotificationService.csproj" -c Release -o /app

FROM build AS publish
RUN dotnet publish "NotificationService.csproj" -c Release -o /app

FROM base AS final
WORKDIR /app
COPY --from=publish /app .
ENTRYPOINT ["dotnet", "NotificationService.dll"]